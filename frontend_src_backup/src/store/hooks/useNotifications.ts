import { useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../app/store';
import { notificationsService } from '../../services/notificationsService';
import * as actions from '../slices/notificationsSlice';

export const useNotificationsData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const state = useSelector((s: RootState) => s.notifications);

  const fetchNotifications = useCallback(async (params?: any) => {
    dispatch(actions.setLoading(true));
    try {
      const res = await notificationsService.listNotifications(params);
      dispatch(actions.setNotifications(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await notificationsService.countUnread();
      dispatch(actions.setUnreadCount(res.data.count ?? 0));
    } catch (_) { /* silent */ }
  }, [dispatch]);

  const markRead = useCallback(async (id: string) => {
    try {
      await notificationsService.markRead(id);
      dispatch(actions.markAsRead(id));
    } catch (_) { /* silent */ }
  }, [dispatch]);

  const markAllRead = useCallback(async () => {
    try {
      await notificationsService.markAllRead();
      dispatch(actions.markAllAsRead());
    } catch (_) { /* silent */ }
  }, [dispatch]);

  const deleteNotification = useCallback(async (id: string) => {
    try {
      await notificationsService.deleteNotification(id);
      dispatch(actions.removeNotification(id));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
    }
  }, [dispatch]);

  const fetchPreferences = useCallback(async () => {
    try {
      const res = await notificationsService.getPreferences();
      dispatch(actions.setPreferences(res.data));
    } catch (_) { /* silent */ }
  }, [dispatch]);

  const updatePreferences = useCallback(async (data: any) => {
    try {
      const res = await notificationsService.updatePreferences(data);
      dispatch(actions.setPreferences(res.data));
    } catch (e: any) {
      dispatch(actions.setError(e.message));
      throw e;
    }
  }, [dispatch]);

  return {
    ...state,
    fetchNotifications, fetchUnreadCount,
    markRead, markAllRead, deleteNotification,
    fetchPreferences, updatePreferences,
  };
};
