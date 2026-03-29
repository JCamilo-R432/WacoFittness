import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { OrgRequest } from '../middleware/multiTenant';
import abTestingService from '../services/abTesting.service';

type Req = AuthRequest & OrgRequest;

// ── A/B Tests ──────────────────────────────────────────────────────────────

export const listTests = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const tests = await abTestingService.listTests(req.organization?.id, status as string);
    res.json({ success: true, tests });
  } catch (err) { next(err); }
};

export const createTest = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, variants, targetAudience, primaryMetric } = req.body;
    if (!name || !variants?.length) {
      res.status(400).json({ error: 'name y variants son requeridos' });
      return;
    }

    const test = await abTestingService.createTest({
      name,
      description,
      variants,
      targetAudience,
      primaryMetric: primaryMetric || 'conversion_rate',
      organizationId: req.organization?.id,
    });

    res.status(201).json({ success: true, test });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const startTest = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const test = await abTestingService.startTest(req.params.testId);
    res.json({ success: true, test });
  } catch (err) { next(err); }
};

export const endTest = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { winnerVariant } = req.body;
    const test = await abTestingService.endTest(req.params.testId, winnerVariant);
    res.json({ success: true, test });
  } catch (err) { next(err); }
};

export const getTestResults = async (req: Req, res: Response, next: NextFunction): Promise<void> => {
  try {
    const results = await abTestingService.getResults(req.params.testId);
    res.json({ success: true, results });
  } catch (err) { next(err); }
};

// ── Variant Assignment (called by client apps) ─────────────────────────────

export const assignVariant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { testName } = req.params;
    const variant = await abTestingService.assignVariant(req.user!.id, testName);
    res.json({ success: true, variant, assigned: variant !== null });
  } catch (err) { next(err); }
};

export const recordConversion = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { testName } = req.params;
    await abTestingService.recordConversion(req.user!.id, testName, req.body.metadata);
    res.json({ success: true });
  } catch (err) { next(err); }
};
