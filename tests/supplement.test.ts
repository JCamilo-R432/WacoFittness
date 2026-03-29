import { getRecommendations, calculateDaysRemaining, checkExpiration, calculateMonthlyCost, checkInteractions } from '../src/utils/supplement.utils';

describe('Supplements Utils', () => {

    it('recommends protein and creatine for muscle gain', () => {
        const recs = getRecommendations({ goal: 'muscleGain' });
        expect(recs.find(r => r.supplement === 'protein')).toBeDefined();
        expect(recs.find(r => r.supplement === 'creatine')).toBeDefined();
    });

    it('calculates days remaining properly', () => {
        const inv = { quantity: 100, dailyDosage: 5 };
        const { daysRemaining, isLowStock } = calculateDaysRemaining(inv);
        expect(daysRemaining).toBe(20);
        expect(isLowStock).toBe(false);
    });

    it('triggers low stock at exactly 7 days', () => {
        const inv = { quantity: 35, dailyDosage: 5 };
        const { daysRemaining, isLowStock } = calculateDaysRemaining(inv);
        expect(daysRemaining).toBe(7);
        expect(isLowStock).toBe(true);
    });

    it('checks expiration dates giving warnings', () => {
        const today = new Date();
        const near = new Date();
        near.setDate(today.getDate() + 10);

        const status = checkExpiration(near);
        expect(status.isExpired).toBe(false);
        expect(status.msg.includes('10 días')).toBe(true);
    });

    it('calculates total monthly cost correctly', () => {
        const inv = [
            { quantity: 100, dailyDosage: 5, purchasePrice: 20 }, // Cost per unit = 0.2. Daily = 1. Monthly = 30
            { quantity: 60, dailyDosage: 2, purchasePrice: 30 }   // Cost per unit = 0.5. Daily = 1. Monthly = 30
        ];
        const cost = calculateMonthlyCost(inv);
        expect(cost).toBe(60);
    });

    it('detects interactions between pre-workout and caffeine', () => {
        const inv = [
            { name: 'Pre-workout' },
            { name: 'Caffeine pills' }
        ];
        const interactions = checkInteractions(inv);
        expect(interactions.length).toBeGreaterThan(0);
        expect(interactions[0]).toContain('cafeína simultáneo');
    });

});
