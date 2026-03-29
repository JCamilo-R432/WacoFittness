import {
    calculateBMR,
    getActivityFactor,
    calculateTDEE,
    calculateTargetCalories,
    calculateMacros,
    calculateWaterIntake
} from '../src/utils/nutrition';

describe('Nutrition Algorithms', () => {
    it('should calculate BMR for MALE correctly', () => {
        // 10 * 80 + 6.25 * 180 - 5 * 25 + 5
        // 800 + 1125 - 125 + 5 = 1805
        const bmr = calculateBMR(80, 180, 25, 'MALE');
        expect(bmr).toBe(1805);
    });

    it('should calculate BMR for FEMALE correctly', () => {
        // 10 * 60 + 6.25 * 165 - 5 * 25 - 161
        // 600 + 1031.25 - 125 - 161 = 1345.25
        const bmr = calculateBMR(60, 165, 25, 'FEMALE');
        expect(bmr).toBe(1345.25);
    });

    it('should get correct activity factor', () => {
        expect(getActivityFactor('sedentario')).toBe(1.2);
        expect(getActivityFactor('moderado')).toBe(1.55);
        expect(getActivityFactor('desconocido')).toBe(1.2); // default
    });

    it('should calculate TDEE', () => {
        expect(calculateTDEE(2000, 'sedentario')).toBe(2400); // 2000 * 1.2
    });

    it('should calculate target calories based on goal', () => {
        expect(calculateTargetCalories(2500, 'ganar_musculo')).toBe(3000);
        expect(calculateTargetCalories(2500, 'definir')).toBe(2000);
        expect(calculateTargetCalories(2500, 'mantener')).toBe(2500);
    });

    it('should calculate macros: 2g protein, 1g fat, rest carbs', () => {
        // Weight: 80kg
        // Target Calories: 3000
        // Protein: 80 * 2 = 160g (160 * 4 = 640 kcal)
        // Fat: 80 * 1 = 80g (80 * 9 = 720 kcal)
        // Remaining kcal: 3000 - (640 + 720) = 3000 - 1360 = 1640 kcal
        // Carbs: 1640 / 4 = 410g
        const macros = calculateMacros(3000, 80);
        expect(macros.targetProteinG).toBe(160);
        expect(macros.targetFatG).toBe(80);
        expect(macros.targetCarbsG).toBe(410);
    });

    it('should calculate water intake', () => {
        // Water base: 35 * 80 = 2800
        // sedentario: +0 = 2800
        expect(calculateWaterIntake(80, 'sedentario')).toBe(2800);
        // activo: +750 = 3550
        expect(calculateWaterIntake(80, 'activo')).toBe(3550);
    });
});
