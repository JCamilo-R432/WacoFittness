import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NutritionProfile, MealLog, MealPlan, FoodItem, NutritionProgress, Recipe } from '../../types/models.types';

interface DailySummary {
  totalCalories: number;
  totalProteinG: number;
  totalCarbsG: number;
  totalFatG: number;
}

interface NutritionState {
  profile: NutritionProfile | null;
  dailyLogs: MealLog[];
  dailySummary: DailySummary | null;
  mealPlans: MealPlan[];
  activePlan: MealPlan | null;
  foods: FoodItem[];
  frequentFoods: FoodItem[];
  searchResults: FoodItem[];
  recipes: Recipe[];
  favoriteRecipes: Recipe[];
  progress: NutritionProgress[];
  weeklySummary: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: NutritionState = {
  profile: null,
  dailyLogs: [],
  dailySummary: null,
  mealPlans: [],
  activePlan: null,
  foods: [],
  frequentFoods: [],
  searchResults: [],
  recipes: [],
  favoriteRecipes: [],
  progress: [],
  weeklySummary: null,
  loading: false,
  error: null,
};

const nutritionSlice = createSlice({
  name: 'nutrition',
  initialState,
  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
      if (action.payload) state.error = null;
    },
    setError(state, action: PayloadAction<string>) {
      state.loading = false;
      state.error = action.payload;
    },
    setProfile(state, action: PayloadAction<NutritionProfile>) {
      state.profile = action.payload;
      state.loading = false;
    },
    setDailyLogs(state, action: PayloadAction<MealLog[]>) {
      state.dailyLogs = action.payload;
      state.loading = false;
    },
    addMealLog(state, action: PayloadAction<MealLog>) {
      state.dailyLogs.push(action.payload);
    },
    removeMealLog(state, action: PayloadAction<string>) {
      state.dailyLogs = state.dailyLogs.filter((l) => l.id !== action.payload);
    },
    setDailySummary(state, action: PayloadAction<DailySummary>) {
      state.dailySummary = action.payload;
      state.loading = false;
    },
    setMealPlans(state, action: PayloadAction<MealPlan[]>) {
      state.mealPlans = action.payload;
      state.loading = false;
    },
    setActivePlan(state, action: PayloadAction<MealPlan | null>) {
      state.activePlan = action.payload;
    },
    setSearchResults(state, action: PayloadAction<FoodItem[]>) {
      state.searchResults = action.payload;
      state.loading = false;
    },
    setFrequentFoods(state, action: PayloadAction<FoodItem[]>) {
      state.frequentFoods = action.payload;
    },
    setRecipes(state, action: PayloadAction<Recipe[]>) {
      state.recipes = action.payload;
      state.loading = false;
    },
    setFavoriteRecipes(state, action: PayloadAction<Recipe[]>) {
      state.favoriteRecipes = action.payload;
    },
    setProgress(state, action: PayloadAction<NutritionProgress[]>) {
      state.progress = action.payload;
      state.loading = false;
    },
    setWeeklySummary(state, action: PayloadAction<any>) {
      state.weeklySummary = action.payload;
    },
    resetNutrition() {
      return initialState;
    },
  },
});

export const {
  setLoading, setError, setProfile, setDailyLogs, addMealLog, removeMealLog,
  setDailySummary, setMealPlans, setActivePlan, setSearchResults, setFrequentFoods,
  setRecipes, setFavoriteRecipes, setProgress, setWeeklySummary, resetNutrition,
} = nutritionSlice.actions;

export default nutritionSlice.reducer;
