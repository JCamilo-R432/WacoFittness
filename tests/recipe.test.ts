import * as service from '../src/services/recipe.service';

jest.mock('../src/repositories/recipe.repository', () => ({
    searchRecipes: jest.fn(),
    getRecipeById: jest.fn(),
    createRecipe: jest.fn(),
    updateRecipe: jest.fn(),
    deleteRecipe: jest.fn(),
    addReview: jest.fn(),
    toggleFavorite: jest.fn(),
    getUserFavorites: jest.fn()
}));

const repo = require('../src/repositories/recipe.repository');

describe('Recipe Service', () => {
    const userId = 'user-123';
    const otherUserId = 'user-456';

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('adjustPortions recalculates macros and ingredients', async () => {
        repo.getRecipeById.mockResolvedValue({
            id: 'r1',
            servings: 2,
            caloriesPerServing: 500,
            proteinPerServing: 20,
            carbsPerServing: 40,
            fatPerServing: 10,
            ingredients: [
                { foodItemId: 'f1', quantity: 100 }
            ]
        });

        const adjusted = await service.adjustPortions('r1', userId, 4);

        expect(repo.getRecipeById).toHaveBeenCalledWith('r1');
        expect(adjusted.servings).toBe(4);
        expect(adjusted.caloriesPerServing).toBe(1000); // 500 * (4/2)
        expect(adjusted.proteinPerServing).toBe(40);
        expect(adjusted.ingredients[0].quantity).toBe(200);
    });

    it('generates recipes based on macros correctly filtering items', async () => {
        repo.searchRecipes.mockResolvedValue({
            items: [
                { id: 'r1', proteinPerServing: 40, carbsPerServing: 40, fatPerServing: 15 },
                { id: 'r2', proteinPerServing: 10, carbsPerServing: 100, fatPerServing: 5 }, // too low pro
            ]
        });

        // Target: 40p, 40c, 15f
        const res = await service.generateRecipesByMacros(400, 40, 40, 15, userId);

        expect(repo.searchRecipes).toHaveBeenCalled();
        expect(res.length).toBe(1);
        expect(res[0].id).toBe('r1');
    });

    it('throws error when editing someone else recipe', async () => {
        repo.getRecipeById.mockResolvedValue({
            id: 'r1',
            creatorId: otherUserId,
            isPublic: true
        });

        await expect(service.updateRecipe('r1', userId, { name: 'test' })).rejects.toThrow('someone else');
    });

    it('throws error when reviewing own recipe', async () => {
        repo.getRecipeById.mockResolvedValue({
            id: 'r1',
            creatorId: userId
        });

        await expect(service.reviewRecipe('r1', userId, 5)).rejects.toThrow('Creators cannot rate their own recipes');
    });
});
