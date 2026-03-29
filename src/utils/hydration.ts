export type ActivityLevel =
    | 'sedentary'
    | 'light'
    | 'moderate'
    | 'active'
    | 'veryActive';

export interface HydrationUserProfile {
    weightKg: number;
    gender: 'male' | 'female';
    activityLevel: ActivityLevel;
    takesCreatine?: boolean;
    takesHighProtein?: boolean;
    temperatureC?: number;
}

export const hydrationFactors: Record<string, number> = {
    water: 1.0,
    flavoredWater: 0.95,
    sportsDrink: 0.9,
    juice: 0.85,
    coffee: 0.85,
    tea: 0.85,
    milk: 0.9,
    proteinShake: 0.85,
    beer: 0.5,
    soda: 0.7,
    other: 1.0,
};

const activityMultiplier: Record<ActivityLevel, number> = {
    sedentary: 1.0,
    light: 1.1,
    moderate: 1.2,
    active: 1.3,
    veryActive: 1.4,
};

export function calculateDailyGoal(profile: HydrationUserProfile): {
    goalMl: number;
    weightFactor: number;
    activityFactor: number;
    climateFactor: number;
    supplementAdjustment: number;
} {
    const weightFactor = 35; // ml/kg base
    const baseMl = profile.weightKg * weightFactor;

    const actMult = activityMultiplier[profile.activityLevel] ?? 1.0;
    const activityMl = baseMl * actMult;

    const temp = profile.temperatureC ?? 22;
    let climateExtra = 0;
    if (temp > 30) {
        climateExtra = 500;
    } else if (temp > 25) {
        climateExtra = 250;
    }
    const climateMl = activityMl + climateExtra;

    let supplementAdjustment = 0;
    if (profile.takesCreatine) supplementAdjustment += 500;
    if (profile.takesHighProtein) supplementAdjustment += 300;

    let finalMl = climateMl + supplementAdjustment;
    if (profile.gender === 'female') {
        finalMl *= 0.9;
    }

    const rounded = Math.round(finalMl / 100) * 100;

    return {
        goalMl: rounded,
        weightFactor,
        activityFactor: actMult,
        climateFactor: climateExtra === 0 ? 1 : (climateMl / activityMl),
        supplementAdjustment,
    };
}

export function getHydrationFactor(liquidType: string): number {
    return hydrationFactors[liquidType] ?? hydrationFactors.other;
}

export interface DehydrationInput {
    intakeMl: number;
    goalMl: number;
    lastUrineColor?: number;
    symptoms?: string[];
    temperatureC?: number;
}

export function detectDehydrationRisk(input: DehydrationInput) {
    let riskFactors = 0;

    if (input.intakeMl < input.goalMl * 0.5) {
        riskFactors += 3;
    } else if (input.intakeMl < input.goalMl * 0.75) {
        riskFactors += 2;
    }

    if ((input.lastUrineColor ?? 0) >= 6) {
        riskFactors += 2;
    }

    const symptoms = input.symptoms ?? [];
    if (symptoms.includes('headache')) riskFactors += 1;
    if (symptoms.includes('dizziness')) riskFactors += 2;
    if (symptoms.includes('muscleCramps')) riskFactors += 2;

    if ((input.temperatureC ?? 0) > 30 && input.intakeMl < input.goalMl * 0.6) {
        riskFactors += 2;
    }

    if (riskFactors >= 5) {
        return { level: 'HIGH' as const, action: 'Beber 500ml inmediatamente' };
    }
    if (riskFactors >= 3) {
        return { level: 'MEDIUM' as const, action: 'Aumentar ingesta hoy' };
    }
    return { level: 'LOW' as const, action: 'Continuar hidratación normal' };
}

export function calculateStreak(
    days: { goalMl: number; intakeMl: number; date: Date }[],
): number {
    let streak = 0;
    const sorted = [...days].sort(
        (a, b) => b.date.getTime() - a.date.getTime(),
    );

    for (const day of sorted) {
        if (day.intakeMl >= day.goalMl * 0.9) {
            streak++;
        } else {
            break;
        }
    }

    return streak;
}

export function calculateHydrationScore(params: {
    goal: number;
    intake: number;
    symptomsCount: number;
    urineColor?: number;
}): number {
    const { goal, intake, symptomsCount, urineColor } = params;
    if (goal <= 0) return 0;

    let baseScore = (intake / goal) * 100;
    baseScore = Math.min(baseScore, 100);

    if (intake >= goal) {
        baseScore += 10;
    }

    if (symptomsCount > 0) {
        baseScore -= symptomsCount * 5;
    }

    if ((urineColor ?? 0) >= 6) {
        baseScore -= 10;
    }

    const bounded = Math.max(0, Math.min(100, Math.round(baseScore)));
    return bounded;
}

