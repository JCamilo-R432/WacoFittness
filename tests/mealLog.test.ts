import { createMealLog, duplicateMealLog, getDailySummary } from '../src/services/mealLog.service';
import * as repo from '../src/repositories/mealLog.repository';
// Mocking the repo
jest.mock('../src/repositories/mealLog.repository');

const mockRepo = repo as jest.Mocked<typeof repo>;

describe('Meal Log Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should not allow dates more than 30 days in the past', async () => {
        const oldDate = new Date();
        oldDate.setDate(oldDate.getDate() - 35);

        await expect(createMealLog('user1', {
            consumedAt: oldDate.toISOString(),
            mealType: 'breakfast',
            quantityG: 100
        })).rejects.toThrow('Date cannot be more than 30 days in the past');
    });

    it('should calculate daily summary properly', async () => {
        mockRepo.findByDateAndType.mockResolvedValue([
            { calories: 200, proteinG: 10, carbsG: 20, fatG: 5 } as any,
            { calories: 300, proteinG: 15, carbsG: 30, fatG: 10 } as any,
        ]);

        const res = await getDailySummary('user1', '2023-10-10');
        expect(res.totalCalories).toBe(500);
        expect(res.totalProteinG).toBe(25);
        expect(res.totalCarbsG).toBe(50);
        expect(res.totalFatG).toBe(15);
    });

    it('duplicate should create exact copy with current date', async () => {
        mockRepo.findById.mockResolvedValue({
            id: 'log1',
            userId: 'user1',
            foodItemId: 'food1',
            mealType: 'lunch',
            consumedAt: new Date('2023-10-10'),
            quantityG: 200,
            calories: 400,
            proteinG: 20,
        } as any);

        mockRepo.create.mockImplementation(async (data) => data as any);

        const dup = await duplicateMealLog('user1', 'log1');
        expect(dup.calories).toBe(400);
        expect(dup.mealType).toBe('lunch');
        expect(dup.quantityG).toBe(200);
        // new date
        expect(new Date(dup.consumedAt).toDateString()).toEqual(new Date().toDateString());
    });
});
