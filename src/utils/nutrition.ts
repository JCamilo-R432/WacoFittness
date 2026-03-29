export const calculateBMR = (
  weightKg: number,
  heightCm: number,
  age: number,
  gender: 'MALE' | 'FEMALE'
): number => {
  if (gender === 'MALE') {
    return (10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5;
  }
  return (10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161;
};

export const getActivityFactor = (level: string): number => {
  const factors: Record<string, number> = {
    sedentario: 1.2,
    ligero: 1.375,
    moderado: 1.55,
    activo: 1.725,
    muy_activo: 1.9
  };
  return factors[level.toLowerCase()] || 1.2;
};

export const calculateTDEE = (bmr: number, activityLevel: string): number => {
  return bmr * getActivityFactor(activityLevel);
};

export const calculateTargetCalories = (tdee: number, goal: string): number => {
  switch (goal.toLowerCase()) {
    case 'ganar_musculo': return tdee + 500;
    case 'definir': return tdee - 500;
    case 'mantener':
    default: return tdee;
  }
};

export const calculateMacros = (targetCalories: number, weightKg: number) => {
  const proteinG = 2 * weightKg;
  const fatG = 1 * weightKg;
  
  const proteinCalories = proteinG * 4;
  const fatCalories = fatG * 9;
  
  const carbsCalories = targetCalories - (proteinCalories + fatCalories);
  const carbsG = carbsCalories > 0 ? carbsCalories / 4 : 0;

  return { targetProteinG: Math.round(proteinG), targetFatG: Math.round(fatG), targetCarbsG: Math.round(carbsG) };
};

export const calculateWaterIntake = (weightKg: number, activityLevel: string): number => {
  const baseWater = 35 * weightKg;
  const adjustments: Record<string, number> = {
    sedentario: 0,
    ligero: 250,
    moderado: 500,
    activo: 750,
    muy_activo: 1000
  };
  return baseWater + (adjustments[activityLevel.toLowerCase()] || 0);
};
