// ── WacoCoach Calculators — Funciones JS puras (sin LLM) ──────────────────
// Toda la matemática fitness se resuelve AQUÍ antes de llamar al LLM.
// El LLM recibe los resultados ya calculados y solo genera lenguaje natural.

export type ActivityLevel =
  | 'sedentary'
  | 'lightly_active'
  | 'moderately_active'
  | 'very_active'
  | 'extra_active';

export type Goal = 'hipertrofia' | 'muscle_gain' | 'perdida_grasa' | 'fat_loss' | 'mantenimiento' | 'maintenance' | 'fuerza' | 'strength';

// ── TMB — Mifflin-St Jeor (más precisa que Harris-Benedict) ───────────────

export function calculateTMB(
  weight: number,   // kg
  height: number,   // cm
  age: number,
  gender: 'male' | 'female',
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  return Math.round(gender === 'male' ? base + 5 : base - 161);
}

// ── TDEE — Gasto calórico total diario ────────────────────────────────────

const ACTIVITY_FACTORS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightly_active: 1.375,
  moderately_active: 1.55,
  very_active: 1.725,
  extra_active: 1.9,
};

export function calculateTDEE(tmb: number, activityLevel: ActivityLevel | string): number {
  const factor = ACTIVITY_FACTORS[activityLevel as ActivityLevel] ?? 1.375;
  return Math.round(tmb * factor);
}

// ── Macros — distribución según objetivo ─────────────────────────────────

export interface MacroResult {
  calories: number;
  protein: { min: number; max: number; unit: 'g' };
  fat: { min: number; max: number; unit: 'g' };
  carbs: { approx: number; unit: 'g' };
  note: string;
}

export function calculateMacros(weight: number, tdee: number, goal: Goal | string): MacroResult {
  const isGain = ['hipertrofia', 'muscle_gain'].includes(goal);
  const isLoss = ['perdida_grasa', 'fat_loss'].includes(goal);

  const proteinRange = isGain
    ? { min: 1.6, max: 2.2 }
    : isLoss
    ? { min: 2.0, max: 2.4 }  // Higher protein on cut to preserve muscle
    : { min: 1.2, max: 1.6 };

  const protein = {
    min: Math.round(proteinRange.min * weight),
    max: Math.round(proteinRange.max * weight),
    unit: 'g' as const,
  };
  const fat = {
    min: Math.round(0.8 * weight),
    max: Math.round(1.2 * weight),
    unit: 'g' as const,
  };

  const avgProteinCals = ((protein.min + protein.max) / 2) * 4;
  const avgFatCals = ((fat.min + fat.max) / 2) * 9;
  const carbCals = Math.max(0, tdee - avgProteinCals - avgFatCals);

  return {
    calories: tdee,
    protein,
    fat,
    carbs: { approx: Math.round(carbCals / 4), unit: 'g' },
    note: 'Ajustar según respuesta corporal y progreso semanal',
  };
}

// ── 1RM — Fórmula de Epley ────────────────────────────────────────────────

export function estimate1RM(weightKg: number, reps: number): number | string {
  if (reps === 1) return weightKg;
  if (reps > 10) return 'No preciso para >10 reps (margen de error alto)';
  return Math.round(weightKg / (1.0278 - 0.0278 * reps));
}

// ── IMC — Índice de Masa Corporal ─────────────────────────────────────────

export interface IMCResult {
  imc: number;
  classification: string;
  note: string;
}

export function calculateIMC(weightKg: number, heightCm: number): IMCResult {
  const heightM = heightCm / 100;
  const imc = weightKg / (heightM * heightM);
  const rounded = Math.round(imc * 10) / 10;

  let classification: string;
  if (imc < 18.5)      classification = 'Bajo peso';
  else if (imc < 25.0) classification = 'Peso normal';
  else if (imc < 30.0) classification = 'Sobrepeso';
  else if (imc < 35.0) classification = 'Obesidad grado I';
  else if (imc < 40.0) classification = 'Obesidad grado II';
  else                 classification = 'Obesidad grado III';

  return {
    imc: rounded,
    classification,
    note: 'El IMC tiene limitaciones importantes: no distingue músculo de grasa. Atletas con alta masa muscular pueden tener IMC elevado. Complementar con circunferencia de cintura y % grasa corporal.',
  };
}

// ── Déficit / superávit calórico ──────────────────────────────────────────

export function calorieTarget(tdee: number, goal: Goal | string): {
  target: number;
  adjustment: number;
  label: string;
} {
  if (['hipertrofia', 'muscle_gain'].includes(goal)) {
    return { target: tdee + 300, adjustment: +300, label: 'Superávit moderado para ganar músculo' };
  }
  if (['perdida_grasa', 'fat_loss'].includes(goal)) {
    return { target: tdee - 400, adjustment: -400, label: 'Déficit moderado para perder grasa' };
  }
  return { target: tdee, adjustment: 0, label: 'Mantenimiento' };
}
