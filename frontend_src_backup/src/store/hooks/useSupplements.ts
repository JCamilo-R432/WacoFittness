import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { supplementsService } from '../../services/supplementsService';
import * as actions from '../slices/supplementsSlice';

export const useSupplements = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.supplements);

  const fetchCatalog = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await supplementsService.getSupplements(params);
      dispatch(actions.setCatalog(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchInventory = useCallback(async () => {
    dispatch(actions.setLoading(true));
    try {
      const res = await supplementsService.getInventory();
      dispatch(actions.setInventory(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const addToInventory = useCallback(async (data: any) => {
    try {
      const res = await supplementsService.addToInventory(data);
      dispatch(actions.addToInventory(res.data));
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  const logConsumption = useCallback(async (data: any) => {
    try {
      const res = await supplementsService.logConsumption(data);
      dispatch(actions.addLog(res.data));
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  const fetchLogs = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await supplementsService.getLogs(params);
      dispatch(actions.setLogs(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchToday = useCallback(async () => {
    try {
      const res = await supplementsService.getTodayLogs();
      dispatch(actions.setTodayLogs(res.data));
    } catch (_) {
      /* silent */
    }
  }, [dispatch]);

  const fetchStacks = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await supplementsService.getStacks(params);
      dispatch(actions.setStacks(res.data));
      dispatch(actions.setLoading(false));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const quickLog = useCallback(async () => {
    // Minimal "quick log": if there's inventory, log the first active one.
    const first = state.inventory?.[0];
    if (!first?.supplementId) return null;
    return await logConsumption({ supplementId: first.supplementId, quantity: first.dailyDosage ?? 1 });
  }, [state.inventory, logConsumption]);

  const fetchRecommendations = useCallback(async () => {
    try {
      const res = await supplementsService.getRecommendations();
      dispatch(actions.setRecommendations(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  return {
    ...state,
    fetchCatalog, fetchInventory, addToInventory,
    logConsumption, fetchRecommendations,
    fetchLogs, fetchToday, fetchStacks, quickLog,
  };
};
