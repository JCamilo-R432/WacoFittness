import { consolidateIngredients, excludePantryItems, groupByCategory, evaluateSavings, getExpirationAlert } from '../src/utils/shopping.utils';

describe('Shopping Utils', () => {

    it('consolidates identical ingredients suming their quantities', () => {
        const list = [
            { name: 'Pollo', unit: 'g', quantity: 200 },
            { name: 'Pollo', unit: 'g', quantity: 300 },
            { name: 'Arroz', unit: 'kg', quantity: 1 }
        ];
        const res = consolidateIngredients(list);

        expect(res.length).toBe(2);
        const pollo = res.find((i: any) => i.name === 'Pollo') as any;
        expect(pollo.quantity).toBe(500);
    });

    it('excludes items already in pantry', () => {
        const needed = [{ name: 'Avena', unit: 'g', quantity: 500 }];
        const pantry = [{ name: 'Avena', unit: 'g', quantity: 300 }];

        const afterExclusion = excludePantryItems(needed, pantry);

        expect(afterExclusion[0].quantity).toBe(200);
    });

    it('completely removes item if fully in pantry', () => {
        const needed = [{ name: 'Sal', unit: 'g', quantity: 50 }];
        const pantry = [{ name: 'Sal', unit: 'g', quantity: 500 }];

        const afterExclusion = excludePantryItems(needed, pantry);
        expect(afterExclusion.length).toBe(0);
    });

    it('evaluates savings', () => {
        const { savings, savingsPercentage } = evaluateSavings(1000, 800);
        expect(savings).toBe(200);
        expect(savingsPercentage).toBe(20);
    });

    it('calculates proper expiration string', () => {
        const today = new Date();

        const past = new Date();
        past.setDate(today.getDate() - 1);
        expect(getExpirationAlert(past)).toBe('Vencido');

        const near = new Date();
        near.setDate(today.getDate() + 2);
        expect(typeof getExpirationAlert(near)).toBe('string');
    });

});
