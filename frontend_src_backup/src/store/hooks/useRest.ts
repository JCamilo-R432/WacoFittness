import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { restService } from '../../services/restService';
import * as actions from '../slices/restSlice';

export const useRest = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.rest);

  const fetchLatest = useCallback(async () => {
    dispatch(actions.setLoading(true));
    try {
      const res = await restService.getLastSleep();
      dispatch(actions.setLastSleep(res.data));
      dispatch(actions.setLoading(false));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchSleepLogs = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await restService.getSleepLogs(params);
      dispatch(actions.setSleepLogs(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const logSleep = useCallback(async (data: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await restService.logSleep(data);
      dispatch(actions.addSleepLog(res.data));
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  const logStress = useCallback(async (data: any) => {
    try {
      const res = await restService.logStress(data);
      dispatch(actions.addStressLog(res.data));
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  const fetchRecoveryScore = useCallback(async () => {
    dispatch(actions.setLoading(true));
    try {
      const res = await restService.getRecoveryScore();
      dispatch(actions.setRecoveryScore(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchTechniques = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await restService.getTechniques(params);
      dispatch(actions.setTechniques(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchRoutines = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await restService.getStretchingRoutines(params);
      dispatch(actions.setRoutines(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const logRelaxation = useCallback(async (techniqueId: string, data: any) => {
    try {
      const res = await restService.logRelaxation(techniqueId, data);
      return res.data;
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  return {
    ...state,
    fetchLatest,
    fetchSleepLogs,
    createSleepLog: logSleep,
    logSleep,
    logStress,
    fetchRecovery: fetchRecoveryScore,
    fetchRecoveryScore,
    fetchTechniques,
    fetchRoutines,
    logRelaxation,
  };
};
