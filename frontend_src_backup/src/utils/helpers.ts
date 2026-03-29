// ========================
// HELPER FUNCTIONS
// ========================

/**
 * Calculate BMR using Mifflin-St Jeor equation
 */
export const calculateBMR = (weightKg: number, heightCm: number, age: number, gender: string): number => {
  if (gender === 'male') {
    return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age + 5);
  }
  return Math.round(10 * weightKg + 6.25 * heightCm - 5 * age - 161);
};

/**
 * Calculate TDEE = BMR × activity multiplier
 */
export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  const multipliers: Record<string, number> = {
    sedentary: 1.2,
    lightlyActive: 1.375,
    moderatelyActive: 1.55,
    veryActive: 1.725,
    extremelyActive: 1.9,
  };
  return Math.round(bmr * (multipliers[activityLevel] ?? 1.55));
};

/**
 * Calculate macro targets based on goal & TDEE
 */
export const calculateMacros = (tdee: number, goal: string, weightKg: number) => {
  let targetCalories = tdee;
  if (goal === 'muscleGain') targetCalories += 300;
  if (goal === 'fatLoss') targetCalories -= 500;

  const proteinG = Math.round(weightKg * (goal === 'muscleGain' ? 2.2 : 2.0));
  const fatG = Math.round((targetCalories * 0.25) / 9);
  const carbsG = Math.round((targetCalories - proteinG * 4 - fatG * 9) / 4);

  return { targetCalories, proteinG, carbsG, fatG };
};

/**
 * Percentage progress clamped to 0-100
 */
export const calcProgress = (current: number, target: number): number => {
  if (target <= 0) return 0;
  return Math.min(Math.round((current / target) * 100), 100);
};

/**
 * Estimated 1RM (Brzycki formula)
 */
export const estimate1RM = (weight: number, reps: number): number => {
  if (reps <= 0) return 0;
  if (reps === 1) return weight;
  return Math.round(weight * (36 / (37 - reps)));
};

/**
 * Training volume = sets × reps × weight
 */
export const calculateVolume = (sets: number, reps: number, weight: number): number => {
  return sets * reps * weight;
};

/**
 * Get greeting based on time of day
 */
export const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return '¡Buenas noches!';
  if (hour < 12) return '¡Buenos días!';
  if (hour < 18) return '¡Buenas tardes!';
  return '¡Buenas noches!';
};

/**
 * Get day name in Spanish
 */
export const getDayName = (date: Date): string => {
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  return days[date.getDay()];
};

/**
 * Generate a random color from a preset palette
 */
export const getModuleColor = (module: string): string => {
  const colors: Record<string, string> = {
    nutrition: '#FF6B6B',
    training: '#6C63FF',
    rest: '#8B5CF6',
    hydration: '#06B6D4',
    supplements: '#F59E0B',
    shopping: '#10B981',
  };
  return colors[module] ?? '#6C63FF';
};

/**
 * Clamp a number between min and max
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Sleep quality label
 */
export const getSleepQualityLabel = (quality: number): string => {
  if (quality >= 5) return 'Excelente';
  if (quality >= 4) return 'Buena';
  if (quality >= 3) return 'Regular';
  if (quality >= 2) return 'Mala';
  return 'Muy Mala';
};

/**
 * Recovery score label
 */
export const getRecoveryLabel = (score: number): { label: string; color: string } => {
  if (score >= 80) return { label: 'Óptimo', color: '#10B981' };
  if (score >= 60) return { label: 'Bueno', color: '#3B82F6' };
  if (score >= 40) return { label: 'Moderado', color: '#F59E0B' };
  return { label: 'Bajo', color: '#EF4444' };
};

/**
 * Truncate text with ellipsis
 */
export const truncate = (text: string, length: number): string => {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
};

/**
 * Generate unique ID for local use
 */
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

/**
 * Debounce function
 */
export const debounce = <T extends (...args: any[]) => any>(fn: T, delay: number) => {
  let timer: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
};
