import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { nutritionService } from '../../services/nutritionService';
import * as actions from '../slices/nutritionSlice';
import { todayISO } from '../../utils/formatters';

export const useNutrition = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.nutrition);

  const fetchProfile = useCallback(async () => {
    dispatch(actions.setLoading(true));
    try {
      const res = await nutritionService.getProfile();
      dispatch(actions.setProfile(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchDailyLogs = useCallback(async (date?: string) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await nutritionService.getMealLogs({ date: date ?? todayISO() });
      dispatch(actions.setDailyLogs(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchDailySummary = useCallback(async (date?: string) => {
    try {
      const res = await nutritionService.getDailySummary(date ?? todayISO());
      dispatch(actions.setDailySummary(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const logMeal = useCallback(async (data: any) => {
    try {
      const res = await nutritionService.logMeal(data);
      dispatch(actions.addMealLog(res.data));
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  const deleteMealLog = useCallback(async (id: string) => {
    try {
      await nutritionService.deleteMealLog(id);
      dispatch(actions.removeMealLog(id));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const searchFoods = useCallback(async (query: string) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await nutritionService.searchFoods(query);
      dispatch(actions.setSearchResults(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchMealPlans = useCallback(async () => {
    dispatch(actions.setLoading(true));
    try {
      const res = await nutritionService.getMealPlans();
      dispatch(actions.setMealPlans(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchFrequentFoods = useCallback(async () => {
    try {
      const res = await nutritionService.getFrequentFoods();
      dispatch(actions.setFrequentFoods(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchRecipes = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await nutritionService.getRecipes(params);
      dispatch(actions.setRecipes(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchProgress = useCallback(async () => {
    dispatch(actions.setLoading(true));
    try {
      const res = await nutritionService.getProgress();
      dispatch(actions.setProgress(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  return {
    ...state,
    fetchProfile, fetchDailyLogs, fetchDailySummary,
    logMeal, deleteMealLog, searchFoods,
    fetchMealPlans, fetchFrequentFoods, fetchRecipes, fetchProgress,
  };
};
