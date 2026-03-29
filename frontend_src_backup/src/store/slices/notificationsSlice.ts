import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { AppNotification, NotificationPreference } from '../../types/models.types';

interface NotificationsState {
  items: AppNotification[];
  unreadCount: number;
  preferences: NotificationPreference | null;
  loading: boolean;
  error: string | null;
}

const initialState: NotificationsState = {
  items: [],
  unreadCount: 0,
  preferences: null,
  loading: false,
  error: null,
};

const notificationsSlice = createSlice({
  name: 'notifications',
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
    setNotifications(state, action: PayloadAction<AppNotification[]>) {
      state.items = action.payload;
      state.loading = false;
    },
    addNotification(state, action: PayloadAction<AppNotification>) {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAsRead(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && item.status !== 'read') {
        item.status = 'read';
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    markAllAsRead(state) {
      state.items.forEach((n) => { n.status = 'read'; });
      state.unreadCount = 0;
    },
    removeNotification(state, action: PayloadAction<string>) {
      const item = state.items.find((n) => n.id === action.payload);
      if (item && item.status !== 'read') state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.items = state.items.filter((n) => n.id !== action.payload);
    },
    setUnreadCount(state, action: PayloadAction<number>) {
      state.unreadCount = action.payload;
    },
    setPreferences(state, action: PayloadAction<NotificationPreference>) {
      state.preferences = action.payload;
    },
    resetNotifications() {
      return initialState;
    },
  },
});

export const {
  setLoading, setError, setNotifications, addNotification,
  markAsRead, markAllAsRead, removeNotification, setUnreadCount,
  setPreferences, resetNotifications,
} = notificationsSlice.actions;

export default notificationsSlice.reducer;
