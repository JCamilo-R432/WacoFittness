/**
 * Tests for Recovery Metrics Service
 * Tests score calculation, recommendation logic
 */

// ── Pure score calculation (mirrors recoveryMetrics.service.ts) ────────────

function calcRecoveryScore(data: {
  hrv?: number;
  sleepHours?: number;
  sleepQuality?: number;
  fatigueLevel?: number;
  stressLevel?: number;
}): number {
  let score = 70;
  if (data.hrv) {
    const hrvScore = Math.min(100, (data.hrv / 80) * 100);
    score = score * 0.6 + hrvScore * 0.4;
  }
  if (data.sleepHours !== undefined && data.sleepQuality !== undefined) {
    const sleepScore = Math.min(100, ((data.sleepHours / 8) * 50) + (data.sleepQuality * 5));
    score = score * 0.7 + sleepScore * 0.3;
  }
  if (data.fatigueLevel !== undefined) {
    const fatigueScore = (11 - data.fatigueLevel) * 10;
    score = score * 0.8 + fatigueScore * 0.2;
  }
  if (data.stressLevel !== undefined) {
    const stressScore = (11 - data.stressLevel) * 10;
    score = score * 0.9 + stressScore * 0.1;
  }
  return Math.round(Math.max(0, Math.min(100, score)));
}

function getRecommendation(score: number): string {
  if (score >= 80) return 'Entrena fuerte hoy — estás en óptimas condiciones';
  if (score >= 60) return 'Entreno moderado — buen estado de recuperación';
  if (score >= 40) return 'Descanso activo recomendado — camina, estira, yoga';
  return 'Descanso total — tu cuerpo necesita recuperarse';
}

describe('RecoveryMetrics — Score Calculation', () => {
  it('returns base score of 70 when no data provided', () => {
    expect(calcRecoveryScore({})).toBe(70);
  });

  it('increases score with high HRV', () => {
    const withHighHRV = calcRecoveryScore({ hrv: 80 });
    const withLowHRV = calcRecoveryScore({ hrv: 20 });
    expect(withHighHRV).toBeGreaterThan(withLowHRV);
  });

  it('increases score with good sleep quality and hours', () => {
    const goodSleep = calcRecoveryScore({ sleepHours: 8, sleepQuality: 9 });
    const badSleep = calcRecoveryScore({ sleepHours: 4, sleepQuality: 2 });
    expect(goodSleep).toBeGreaterThan(badSleep);
  });

  it('decreases score with high fatigue level', () => {
    const lowFatigue = calcRecoveryScore({ fatigueLevel: 1 });
    const highFatigue = calcRecoveryScore({ fatigueLevel: 10 });
    expect(lowFatigue).toBeGreaterThan(highFatigue);
  });

  it('decreases score with high stress', () => {
    const lowStress = calcRecoveryScore({ stressLevel: 1 });
    const highStress = calcRecoveryScore({ stressLevel: 10 });
    expect(lowStress).toBeGreaterThan(highStress);
  });

  it('score is always between 0 and 100', () => {
    const worst = calcRecoveryScore({ hrv: 0, sleepHours: 0, sleepQuality: 1, fatigueLevel: 10, stressLevel: 10 });
    const best = calcRecoveryScore({ hrv: 100, sleepHours: 9, sleepQuality: 10, fatigueLevel: 1, stressLevel: 1 });
    expect(worst).toBeGreaterThanOrEqual(0);
    expect(best).toBeLessThanOrEqual(100);
  });

  it('combines all factors correctly', () => {
    const combined = calcRecoveryScore({ hrv: 70, sleepHours: 7.5, sleepQuality: 8, fatigueLevel: 3, stressLevel: 3 });
    expect(combined).toBeGreaterThan(70);
  });
});

describe('RecoveryMetrics — Recommendations', () => {
  it('returns train hard recommendation for score >= 80', () => {
    expect(getRecommendation(80)).toContain('fuerte');
    expect(getRecommendation(95)).toContain('fuerte');
    expect(getRecommendation(100)).toContain('fuerte');
  });

  it('returns moderate recommendation for score 60-79', () => {
    expect(getRecommendation(60)).toContain('moderado');
    expect(getRecommendation(70)).toContain('moderado');
    expect(getRecommendation(79)).toContain('moderado');
  });

  it('returns active rest recommendation for score 40-59', () => {
    expect(getRecommendation(40)).toContain('activo');
    expect(getRecommendation(55)).toContain('activo');
    expect(getRecommendation(59)).toContain('activo');
  });

  it('returns full rest recommendation for score < 40', () => {
    expect(getRecommendation(39)).toContain('total');
    expect(getRecommendation(20)).toContain('total');
    expect(getRecommendation(0)).toContain('total');
  });

  it('handles boundary score of exactly 80', () => {
    expect(getRecommendation(80)).toContain('fuerte');
  });

  it('handles boundary score of exactly 60', () => {
    expect(getRecommendation(60)).toContain('moderado');
  });
});
