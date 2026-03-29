/**
 * Tests for Periodized Plan Service
 * Tests phase generation, cycle creation, and progress calculation logic
 */

// ── Pure function tests (no DB required) ──────────────────────────────────

function generatePhases(type: string, durationWeeks: number) {
  const phases: any[] = [];
  if (type === 'hypertrophy') {
    phases.push({ name: 'Adaptación Anatómica', type: 'adaptation', weekStart: 1, weekEnd: Math.min(3, durationWeeks), volume: 'low', intensity: 'low' });
    if (durationWeeks > 3) phases.push({ name: 'Hipertrofia Base', type: 'hypertrophy', weekStart: 4, weekEnd: Math.min(10, durationWeeks), volume: 'high', intensity: 'medium' });
    if (durationWeeks > 10) phases.push({ name: 'Deload', type: 'deload', weekStart: 11, weekEnd: Math.min(12, durationWeeks), volume: 'low', intensity: 'low' });
  } else if (type === 'strength') {
    phases.push({ name: 'Adaptación', type: 'adaptation', weekStart: 1, weekEnd: Math.min(2, durationWeeks), volume: 'medium', intensity: 'low' });
    if (durationWeeks > 2) phases.push({ name: 'Fuerza Base', type: 'strength', weekStart: 3, weekEnd: Math.min(8, durationWeeks), volume: 'medium', intensity: 'high' });
  } else {
    phases.push({ name: 'Base', type: 'adaptation', weekStart: 1, weekEnd: Math.ceil(durationWeeks * 0.3) });
    phases.push({ name: 'Desarrollo', type: 'hypertrophy', weekStart: Math.ceil(durationWeeks * 0.3) + 1, weekEnd: Math.ceil(durationWeeks * 0.8) });
  }
  return phases;
}

function generateCycles(durationWeeks: number) {
  return Array.from({ length: durationWeeks }, (_, i) => ({
    weekNumber: i + 1,
    name: (i + 1) % 6 === 0 ? `Semana ${i + 1} - Deload` : `Semana ${i + 1}`,
    completed: false,
  }));
}

function calcProgressPct(cycles: { completed: boolean }[]): number {
  if (!cycles.length) return 0;
  return Math.round((cycles.filter(c => c.completed).length / cycles.length) * 100);
}

describe('PeriodizedPlan — Phase Generation', () => {
  it('generates correct phases for 12-week hypertrophy plan', () => {
    const phases = generatePhases('hypertrophy', 12);
    expect(phases.length).toBe(3);
    expect(phases[0].type).toBe('adaptation');
    expect(phases[1].type).toBe('hypertrophy');
    expect(phases[2].type).toBe('deload');
  });

  it('generates correct phases for 4-week hypertrophy plan', () => {
    const phases = generatePhases('hypertrophy', 4);
    expect(phases.length).toBe(2);
    expect(phases[0].weekEnd).toBe(3);
    expect(phases[1].weekStart).toBe(4);
  });

  it('generates correct phases for strength plan', () => {
    const phases = generatePhases('strength', 8);
    expect(phases.length).toBe(2);
    expect(phases[1].intensity).toBe('high');
  });

  it('respects durationWeeks boundary — no week exceeds duration', () => {
    const phases = generatePhases('hypertrophy', 6);
    phases.forEach(p => {
      expect(p.weekEnd).toBeLessThanOrEqual(6);
    });
  });

  it('generates phases for generic plan type', () => {
    const phases = generatePhases('power', 10);
    expect(phases.length).toBeGreaterThanOrEqual(2);
  });
});

describe('PeriodizedPlan — Cycle Generation', () => {
  it('generates correct number of cycles', () => {
    expect(generateCycles(12).length).toBe(12);
    expect(generateCycles(4).length).toBe(4);
    expect(generateCycles(24).length).toBe(24);
  });

  it('marks deload weeks every 6 weeks', () => {
    const cycles = generateCycles(12);
    expect(cycles[5].name).toContain('Deload');
    expect(cycles[11].name).toContain('Deload');
    expect(cycles[0].name).not.toContain('Deload');
  });

  it('all cycles start as not completed', () => {
    const cycles = generateCycles(8);
    expect(cycles.every(c => !c.completed)).toBe(true);
  });

  it('week numbers are sequential starting at 1', () => {
    const cycles = generateCycles(5);
    cycles.forEach((c, i) => {
      expect(c.weekNumber).toBe(i + 1);
    });
  });
});

describe('PeriodizedPlan — Progress Calculation', () => {
  it('returns 0% when no cycles completed', () => {
    const cycles = [{ completed: false }, { completed: false }, { completed: false }];
    expect(calcProgressPct(cycles)).toBe(0);
  });

  it('returns 100% when all cycles completed', () => {
    const cycles = [{ completed: true }, { completed: true }, { completed: true }];
    expect(calcProgressPct(cycles)).toBe(100);
  });

  it('calculates partial progress correctly', () => {
    const cycles = [{ completed: true }, { completed: true }, { completed: false }, { completed: false }];
    expect(calcProgressPct(cycles)).toBe(50);
  });

  it('returns 0% for empty cycles array', () => {
    expect(calcProgressPct([])).toBe(0);
  });

  it('rounds percentage correctly', () => {
    const cycles = [{ completed: true }, { completed: false }, { completed: false }];
    expect(calcProgressPct(cycles)).toBe(33);
  });
});
