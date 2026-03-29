import crypto from 'crypto';
import prisma from '../config/database';
import { ABTestVariant, ABTestResults } from '../shared/types/EnterpriseTypes';

class ABTestingService {

  // ── Create & Manage Tests ──────────────────────────────────────────────

  async createTest(data: {
    name: string;
    description?: string;
    variants: ABTestVariant[];
    targetAudience?: { percentage: number; criteria?: Record<string, unknown> };
    primaryMetric: string;
    organizationId?: string;
  }) {
    // Validate weights sum to 100
    const totalWeight = data.variants.reduce((sum, v) => sum + v.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error(`Los pesos de las variantes deben sumar 100 (actual: ${totalWeight})`);
    }

    return prisma.aBTest.create({
      data: {
        name: data.name,
        description: data.description,
        variants: data.variants as any,
        targetAudience: data.targetAudience as any,
        primaryMetric: data.primaryMetric,
        organizationId: data.organizationId,
        status: 'draft',
      },
    });
  }

  async startTest(testId: string) {
    return prisma.aBTest.update({
      where: { id: testId },
      data: { status: 'running', startedAt: new Date() },
    });
  }

  async pauseTest(testId: string) {
    return prisma.aBTest.update({
      where: { id: testId },
      data: { status: 'paused' },
    });
  }

  async endTest(testId: string, winnerVariant?: string) {
    return prisma.aBTest.update({
      where: { id: testId },
      data: { status: 'completed', endedAt: new Date(), winnerVariant },
    });
  }

  // ── Variant Assignment ─────────────────────────────────────────────────

  /**
   * Deterministically assigns a user to a variant using consistent hashing.
   * Same user always gets same variant for same test.
   */
  async assignVariant(userId: string, testName: string): Promise<string | null> {
    const test = await prisma.aBTest.findFirst({
      where: { name: testName, status: 'running' },
    });

    if (!test) return null;

    const variants = test.variants as unknown as ABTestVariant[];
    const audience = test.targetAudience as { percentage: number } | null;

    // Check if user is in target audience
    if (audience?.percentage !== undefined) {
      const inAudience = this.hashBucket(userId, testName) < audience.percentage;
      if (!inAudience) return null;
    }

    // Check existing assignment
    const existing = await prisma.aBTestExposure.findUnique({
      where: { testId_userId: { testId: test.id, userId } },
    });

    if (existing) return existing.variant;

    // Assign variant via weighted random (deterministic per user+test)
    const variant = this.assignWeightedVariant(userId, test.id, variants);

    // Record exposure
    await prisma.aBTestExposure.create({
      data: { testId: test.id, userId, variant },
    });

    return variant;
  }

  async recordConversion(userId: string, testName: string, metadata?: Record<string, unknown>) {
    const test = await prisma.aBTest.findFirst({
      where: { name: testName, status: 'running' },
    });

    if (!test) return;

    await prisma.aBTestExposure.updateMany({
      where: { testId: test.id, userId, converted: false },
      data: { converted: true, convertedAt: new Date(), metadata: metadata as any },
    });
  }

  // ── Results Analysis ───────────────────────────────────────────────────

  async getResults(testId: string): Promise<ABTestResults> {
    const test = await prisma.aBTest.findUnique({
      where: { id: testId },
      include: { exposures: true },
    });

    if (!test) throw new Error('Test no encontrado');

    const variants = test.variants as unknown as ABTestVariant[];
    const exposures = test.exposures;

    const variantStats = variants.map(v => {
      const variantExposures = exposures.filter(e => e.variant === v.name);
      const conversions = variantExposures.filter(e => e.converted);
      const conversionRate = variantExposures.length > 0
        ? conversions.length / variantExposures.length
        : 0;

      return {
        name: v.name,
        exposures: variantExposures.length,
        conversions: conversions.length,
        conversionRate,
        lift: 0, // Calculated below
        pValue: 1,
        significant: false,
      };
    });

    // Calculate lift vs control (first variant)
    const control = variantStats[0];
    for (let i = 1; i < variantStats.length; i++) {
      const variant = variantStats[i];
      if (control.conversionRate > 0) {
        variant.lift = ((variant.conversionRate - control.conversionRate) / control.conversionRate) * 100;
      }

      // Simple z-test for significance
      const pValue = this.calculatePValue(
        control.conversions, control.exposures,
        variant.conversions, variant.exposures,
      );
      variant.pValue = pValue;
      variant.significant = pValue < 0.05 && variant.exposures >= 100;
    }

    const totalExposures = exposures.length;
    const hasEnoughData = totalExposures >= 100;
    const winner = variantStats.find(v => v.significant && v.lift > 0);

    let recommendation: ABTestResults['recommendation'] = 'INSUFFICIENT_DATA';
    if (hasEnoughData) {
      if (winner) recommendation = 'ROLLOUT';
      else if (variantStats.every(v => v.exposures >= 100 && !v.significant)) recommendation = 'CONTINUE';
      else recommendation = 'CONTINUE';
    }

    return {
      testName: test.name,
      totalExposures,
      variants: variantStats,
      winnerVariant: test.winnerVariant || winner?.name,
      recommendation,
    };
  }

  async listTests(organizationId?: string, status?: string) {
    return prisma.aBTest.findMany({
      where: {
        ...(organizationId && { organizationId }),
        ...(status && { status }),
      },
      include: { _count: { select: { exposures: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────

  private hashBucket(userId: string, testName: string): number {
    const hash = crypto.createHash('md5').update(`${userId}:${testName}`).digest('hex');
    return (parseInt(hash.slice(0, 8), 16) % 100) + 1; // 1-100
  }

  private assignWeightedVariant(userId: string, testId: string, variants: ABTestVariant[]): string {
    const bucket = this.hashBucket(userId, testId);
    let cumulative = 0;

    for (const variant of variants) {
      cumulative += variant.weight;
      if (bucket <= cumulative) return variant.name;
    }

    return variants[variants.length - 1].name;
  }

  /**
   * Two-proportion z-test (simplified).
   */
  private calculatePValue(c1: number, n1: number, c2: number, n2: number): number {
    if (n1 === 0 || n2 === 0) return 1;

    const p1 = c1 / n1;
    const p2 = c2 / n2;
    const pPool = (c1 + c2) / (n1 + n2);

    const se = Math.sqrt(pPool * (1 - pPool) * (1 / n1 + 1 / n2));
    if (se === 0) return 1;

    const z = Math.abs(p1 - p2) / se;

    // Approximate two-tailed p-value from z-score
    // Using approximation: p ≈ 2 * (1 - Φ(|z|))
    const p = 2 * (1 - this.normalCDF(z));
    return Math.min(1, Math.max(0, p));
  }

  private normalCDF(z: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(z));
    const d = 0.3989423 * Math.exp(-z * z / 2);
    const p = d * t * (0.3193815 + t * (-0.3565638 + t * (1.7814779 + t * (-1.8212560 + t * 1.3302744))));
    return z > 0 ? 1 - p : p;
  }
}

export const abTestingService = new ABTestingService();
export default abTestingService;
