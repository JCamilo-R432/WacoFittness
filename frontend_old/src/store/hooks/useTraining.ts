import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { trainingService } from '../../services/trainingService';
import * as actions from '../slices/trainingSlice';

export const useTraining = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.training);

  const fetchWorkouts = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await trainingService.getWorkouts(params);
      dispatch(actions.setWorkouts(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchWeeklySummary = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await trainingService.getWeeklySummary(params);
      dispatch(actions.setWeeklySummary(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchPRs = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await trainingService.getPRs(params);
      dispatch(actions.setPRs(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchProgress = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await trainingService.getProgress(params);
      dispatch(actions.setProgress(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchProfile = useCallback(async () => {
    dispatch(actions.setLoading(true));
    try {
      const res = await trainingService.getProfile();
      dispatch(actions.setProfile(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchExercises = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await trainingService.getExercises(params);
      dispatch(actions.setExercises(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchWorkoutLogs = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await trainingService.getWorkoutLogs(params);
      dispatch(actions.setWorkoutLogs(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const createWorkoutLog = useCallback(async (data: any) => {
    try {
      const res = await trainingService.createWorkoutLog(data);
      dispatch(actions.addWorkoutLog(res.data));
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  const deleteWorkoutLog = useCallback(async (id: string) => {
    try {
      await trainingService.deleteWorkoutLog(id);
      dispatch(actions.removeWorkoutLog(id));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const calculate1RM = useCallback(async (data: any) => {
    try {
      const res = await trainingService.calculate1RM(data);
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  return {
    ...state,
    fetchWorkouts, fetchWeeklySummary, fetchPRs, fetchProgress,
    fetchProfile, fetchExercises, fetchWorkoutLogs,
    createWorkoutLog,
    logWorkout: createWorkoutLog,
    deleteWorkoutLog, calculate1RM,
  };
};
