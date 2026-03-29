import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { authService } from '../../services/authService';
import { loginStart, loginSuccess, loginFailure, logout as logoutAction } from '../slices/authSlice';

export const useAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.auth);

  const login = useCallback(
    async (email: string, password: string) => {
      dispatch(loginStart());
      try {
        const res = await authService.login({ email, password });
        dispatch(loginSuccess(res.data));
        await AsyncStorage.setItem('token', res.data.token);
      } catch (e: any) {
        dispatch(loginFailure(e.message ?? 'Error de login'));
        throw e;
      }
    },
    [dispatch],
  );

  const logout = useCallback(async () => {
    await AsyncStorage.removeItem('token');
    dispatch(logoutAction());
  }, [dispatch]);

  return { ...state, login, logout };
};

