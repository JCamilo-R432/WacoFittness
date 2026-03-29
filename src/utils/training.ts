export const calculate1RM = (weight: number, reps: number, formula: 'epley' | 'brzycki' | 'lander' | 'lombardi' | 'average' = 'average'): number => {
    if (reps === 1) return weight;

    const epley = weight * (1 + (reps / 30));
    const brzycki = weight * (36 / (37 - reps));
    const lander = (100 * weight) / (101.3 - 2.67123 * reps);
    const lombardi = weight * Math.pow(reps, 0.10);

    switch (formula) {
        case 'epley': return Math.round(epley);
        case 'brzycki': return Math.round(brzycki);
        case 'lander': return Math.round(lander);
        case 'lombardi': return Math.round(lombardi);
        case 'average':
        default: return Math.round((epley + brzycki + lander + lombardi) / 4);
    }
};

export const calculatePercentages = (oneRM: number) => {
    return [50, 60, 70, 75, 80, 85, 90, 95].map(pct => ({
        percentage: pct,
        weight: Math.round(oneRM * (pct / 100))
    }));
};

export const calculateVolume = (sets: number, reps: number, weight: number): number => {
    return sets * reps * weight;
};

export const calculateRelativeIntensity = (weight: number, oneRM: number): number => {
    if (oneRM <= 0) return 0;
    return Math.round((weight / oneRM) * 100);
};

export const reverseRPE = (reps: number, rpe: number): number => {
    // Approximate reps in reserve (RIR)
    const rir = 10 - rpe;
    return reps + rir; // Virtual max reps you could do
};

export const recommendWeeklyProgression = (experienceLevel: string): number => {
    // Weight increment in Kg per week loosely based on experience
    switch (experienceLevel) {
        case 'beginner': return 2.5;
        case 'intermediate': return 1.25;
        case 'advanced': return 0.5;
        case 'elite': return 0;
        default: return 1.25;
    }
};

export const checkStagnation = (weightHistory: number[]): boolean => {
    if (weightHistory.length < 3) return false;
    // If last 3 sessions had no improvement
    const last3 = weightHistory.slice(-3);
    return last3.every(w => w <= last3[0]);
};

export const checkDeload = (weeksTrainedContinously: number): boolean => {
    return weeksTrainedContinously >= 6; // Deload every 6-8 weeks
};
