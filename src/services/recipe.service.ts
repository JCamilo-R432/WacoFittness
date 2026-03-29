import * as repo from '../repositories/recipe.repository';
// import { redisClient, connectRedis } from '../utils/redis'; // Could be used to cache recipe results

export const getRecipes = async (
    query: string = '',
    minCal: number = 0,
    maxCal: number = 0,
    tags: string = '',
    page: number = 1,
    limit: number = 20,
    userId: string
) => {
    const tagsArr = tags ? tags.split(',') : [];
    return await repo.searchRecipes(query, minCal, maxCal, tagsArr, page, limit, userId);
};

export const getRecipeById = async (id: string, userId: string) => {
    const recipe = await repo.getRecipeById(id);
    if (!recipe) throw new Error('Recipe not found');
    if (!recipe.isPublic && recipe.creatorId !== userId) throw new Error('Unauthorized access to this recipe');
    return recipe;
};

export const createRecipe = async (userId: string, data: any) => {
    return await repo.createRecipe(userId, data);
};

export const updateRecipe = async (id: string, userId: string, data: any) => {
    const recipe = await repo.getRecipeById(id);
    if (!recipe) throw new Error('Recipe not found');
    if (recipe.creatorId !== userId) throw new Error('Cannot edit recipe belonging to someone else');
    return await repo.updateRecipe(id, data);
};

export const deleteRecipe = async (id: string, userId: string) => {
    const recipe = await repo.getRecipeById(id);
    if (!recipe) throw new Error('Recipe not found');
    if (recipe.creatorId !== userId) throw new Error('Cannot delete recipe belonging to someone else');
    return await repo.deleteRecipe(id);
};

export const reviewRecipe = async (id: string, userId: string, rating: number, comentario?: string) => {
    const recipe = await repo.getRecipeById(id);
    if (!recipe) throw new Error('Recipe not found');
    if (recipe.creatorId === userId) throw new Error('Creators cannot rate their own recipes');
    return await repo.addReview(id, userId, rating, comentario);
};

export const favoriteRecipe = async (id: string, userId: string) => {
    return await repo.toggleFavorite(id, userId);
};

export const getUserFavorites = async (userId: string) => {
    return await repo.getUserFavorites(userId);
};

export const adjustPortions = async (id: string, userId: string, newServings: number) => {
    const recipe = await repo.getRecipeById(id);
    if (!recipe) throw new Error('Recipe not found');
    const ratio = newServings / recipe.servings;

    return {
        ...recipe,
        servings: newServings,
        caloriesPerServing: recipe.caloriesPerServing ? Math.round(recipe.caloriesPerServing * ratio) : null,
        proteinPerServing: recipe.proteinPerServing ? Number(recipe.proteinPerServing) * ratio : null,
        carbsPerServing: recipe.carbsPerServing ? Number(recipe.carbsPerServing) * ratio : null,
        fatPerServing: recipe.fatPerServing ? Number(recipe.fatPerServing) * ratio : null,
        ingredients: recipe.ingredients.map(ing => ({
            ...ing,
            quantity: Number(ing.quantity) * ratio
        }))
    };
};

export const generateRecipesByMacros = async (targetCal: number, targetPro: number, targetCarb: number, targetFat: number, userId: string) => {
    // Simple heuristic searching matching boundaries of +-20% macros
    const result = await repo.searchRecipes('', targetCal * 0.8, targetCal * 1.2, [], 1, 10, userId);
    return result.items.filter(r => {
        const rp = Number(r.proteinPerServing || 0);
        const rc = Number(r.carbsPerServing || 0);
        const rf = Number(r.fatPerServing || 0);
        return (
            rp >= targetPro * 0.7 && rp <= targetPro * 1.3 &&
            rc >= targetCarb * 0.7 && rc <= targetCarb * 1.3 &&
            rf >= targetFat * 0.7 && rf <= targetFat * 1.3
        );
    });
};
