import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { HydrationGoal, HydrationLog, HydrationAchievement } from '../../types/models.types';

interface HydrationState {
  goal: HydrationGoal | null;
  todayLogs: HydrationLog[];
  todayTotal: number;
  weeklySummary: any | null;
  achievements: HydrationAchievement[];
  reminders: any[];
  settings: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: HydrationState = {
  goal: null,
  todayLogs: [],
  todayTotal: 0,
  weeklySummary: null,
  achievements: [],
  reminders: [],
  settings: null,
  loading: false,
  error: null,
};

const hydrationSlice = createSlice({
  name: 'hydration',
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
    setGoal(state, action: PayloadAction<HydrationGoal>) {
      state.goal = action.payload;
      state.loading = false;
    },
    setTodayLogs(state, action: PayloadAction<HydrationLog[]>) {
      state.todayLogs = action.payload;
      state.todayTotal = action.payload.reduce((sum, l) => sum + l.effectiveMl, 0);
      state.loading = false;
    },
    addLog(state, action: PayloadAction<HydrationLog>) {
      state.todayLogs.push(action.payload);
      state.todayTotal += action.payload.effectiveMl;
    },
    removeLog(state, action: PayloadAction<string>) {
      const log = state.todayLogs.find((l) => l.id === action.payload);
      if (log) state.todayTotal -= log.effectiveMl;
      state.todayLogs = state.todayLogs.filter((l) => l.id !== action.payload);
    },
    setWeeklySummary(state, action: PayloadAction<any>) {
      state.weeklySummary = action.payload;
    },
    setAchievements(state, action: PayloadAction<HydrationAchievement[]>) {
      state.achievements = action.payload;
    },
    setReminders(state, action: PayloadAction<any[]>) {
      state.reminders = action.payload;
    },
    setSettings(state, action: PayloadAction<any>) {
      state.settings = action.payload;
    },
    resetHydration() {
      return initialState;
    },
  },
});

export const {
  setLoading, setError, setGoal, setTodayLogs, addLog, removeLog,
  setWeeklySummary, setAchievements, setReminders, setSettings, resetHydration,
} = hydrationSlice.actions;

export default hydrationSlice.reducer;
