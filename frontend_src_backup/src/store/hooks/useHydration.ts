import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { hydrationService } from '../../services/hydrationService';
import * as actions from '../slices/hydrationSlice';

export const useHydration = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.hydration);

  const fetchGoal = useCallback(async () => {
    dispatch(actions.setLoading(true));
    try {
      const res = await hydrationService.getGoal();
      dispatch(actions.setGoal(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchTodayLogs = useCallback(async () => {
    dispatch(actions.setLoading(true));
    try {
      const res = await hydrationService.getTodayLogs();
      dispatch(actions.setTodayLogs(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const logIntake = useCallback(async (data: any) => {
    try {
      const res = await hydrationService.logIntake(data);
      dispatch(actions.addLog(res.data));
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  const quickAdd = useCallback(async (amountMl: number) => {
    try {
      const res = await hydrationService.quickAdd({ amountMl, liquidType: 'water' });
      dispatch(actions.addLog(res.data));
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  const deleteLog = useCallback(async (id: string) => {
    try {
      await hydrationService.deleteLog(id);
      dispatch(actions.removeLog(id));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchWeeklySummary = useCallback(async () => {
    try {
      const res = await hydrationService.getWeeklySummary();
      dispatch(actions.setWeeklySummary(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  return {
    ...state,
    fetchGoal, fetchTodayLogs, logIntake,
    quickAdd, deleteLog, fetchWeeklySummary,
  };
};
