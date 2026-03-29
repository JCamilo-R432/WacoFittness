export const calculateRecoveryScore = (
    sleepHours: number,
    sleepQuality: number,
    stressLevel: number,
    trainingIntensity: number = 0
): number => {
    // Score de 0 a 100
    // Sleep Hours: min(8, sleepHours) / 8 * 40 points
    const sleepHoursScore = Math.min((sleepHours / 8) * 40, 40);
    // Sleep Quality: 5 -> 20 points
    const sleepQualityScore = (sleepQuality / 5) * 20;
    // Stress Level (inverted): 10 -> 0 points, 1 -> 20 points
    const stressScore = Math.max(0, ((10 - stressLevel) / 9) * 20);
    // Training Intensity (penalty): -0 to -10, or could just use a base 20 points
    const trainingScore = Math.max(0, 20 - (trainingIntensity / 10) * 10);

    return Math.max(0, Math.min(100, Math.round(sleepHoursScore + sleepQualityScore + stressScore + trainingScore)));
};

export const recommendSleepHours = (age: number, activityLevel: string): number => {
    let baseHours = 8;
    if (age < 18) baseHours = 9;

    if (activityLevel === 'activo' || activityLevel === 'muy_activo') {
        baseHours += 1;
    }
    return baseHours;
};

export const detectDeloadWeek = (weeksTrainedContinously: number, consecutiveHighFatigueDays: number): boolean => {
    return weeksTrainedContinously >= 8 || consecutiveHighFatigueDays >= 4;
};

export const calculateOptimalBedtime = (wakeTime: Date, targetHours: number): Date => {
    // Return wakeTime minus targetHours. Cycles are typically 90 mins, we assume user adjusts target.
    const ms = wakeTime.getTime() - (targetHours * 60 * 60 * 1000);
    return new Date(ms);
};
