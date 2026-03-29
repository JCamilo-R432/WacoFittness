import { generateMealPlan, generateShoppingList as getShoppingList } from '../src/services/mealPlan.service';
import * as mealPlanRepo from '../src/repositories/mealPlan.repository';
import * as profileService from '../src/services/nutritionProfile.service';

jest.mock('../src/repositories/mealPlan.repository');
jest.mock('../src/services/nutritionProfile.service');
jest.mock('../src/config/database', () => ({
    __esModule: true,
    default: {
        foodItem: { findMany: jest.fn().mockResolvedValue([]) },
        $connect: jest.fn(),
        $disconnect: jest.fn(),
    },
}));

jest.mock('@prisma/client', () => {
    const mockFoodFindMany = jest.fn().mockResolvedValue([]);
    return {
        PrismaClient: jest.fn().mockImplementation(() => ({
            foodItem: { findMany: mockFoodFindMany },
            $connect: jest.fn(),
            $disconnect: jest.fn(),
        })),
    };
});

const mockRepo = mealPlanRepo as jest.Mocked<typeof mealPlanRepo>;
const mockProfile = profileService as jest.Mocked<typeof profileService>;

describe('Meal Plan Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not allow generating plan if > 3 active', async () => {
        mockRepo.countActivePlans.mockResolvedValue(3);

        await expect(generateMealPlan('user1', 7, [])).rejects.toThrow('Maximum of 3 active meal plans allowed');
    });

    it('should not allow generating if overlaps', async () => {
        mockRepo.countActivePlans.mockResolvedValue(1);
        mockRepo.hasOverlappingPlan.mockResolvedValue(true);

        await expect(generateMealPlan('user1', 7, [])).rejects.toThrow('overlap with an existing active plan');
    });

    it('should generate plan with correct macros distribution', async () => {
        mockRepo.countActivePlans.mockResolvedValue(0);
        mockRepo.hasOverlappingPlan.mockResolvedValue(false);

        mockProfile.getProfile.mockResolvedValue({
            targetCalories: 2000,
            targetProteinG: 100,
            targetCarbsG: 200,
            targetFatG: 50
        } as any);

        mockRepo.createPlan.mockImplementation(async (data, days) => ({ ...data, days } as any));

        const plan = await generateMealPlan('user1', 1, []);

        expect(plan.durationDays).toBe(1);
        expect(plan.totalCalories).toBe(2000); // 1 day * 2000 sum across meals

        const day = plan.days[0];
        const breakfast = day.meals.find((m: any) => m.mealType === 'breakfast');
        expect(breakfast!.calories).toBe(500); // 25% of 2000
        expect(breakfast!.proteinG).toBe(25); // 25% of 100
    });

    it('shopping list should remove duplicates (logic mock check)', async () => {
        mockRepo.getPlanById.mockResolvedValue({
            id: 'plan1',
            days: [
                { meals: [{ name: 'Chicken', mealType: 'lunch' }] },
                { meals: [{ name: 'Chicken', mealType: 'dinner' }] }
            ]
        } as any);

        const check = await getShoppingList('user1', 'plan1');
        expect(check.list.length).toBe(2);
        expect(check.list[0].mealName).toBe('Chicken');
    });
});
