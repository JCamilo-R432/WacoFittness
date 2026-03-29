import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Supplement, UserSupplement, SupplementLog, SupplementStack } from '../../types/models.types';

interface SupplementsState {
  catalog: Supplement[];
  inventory: UserSupplement[];
  logs: SupplementLog[];
  todayLogs: SupplementLog[];
  stacks: SupplementStack[];
  recommendations: any | null;
  analytics: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: SupplementsState = {
  catalog: [],
  inventory: [],
  logs: [],
  todayLogs: [],
  stacks: [],
  recommendations: null,
  analytics: null,
  loading: false,
  error: null,
};

const supplementsSlice = createSlice({
  name: 'supplements',
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
    setCatalog(state, action: PayloadAction<Supplement[]>) {
      state.catalog = action.payload;
      state.loading = false;
    },
    setInventory(state, action: PayloadAction<UserSupplement[]>) {
      state.inventory = action.payload;
      state.loading = false;
    },
    addToInventory(state, action: PayloadAction<UserSupplement>) {
      state.inventory.push(action.payload);
    },
    setLogs(state, action: PayloadAction<SupplementLog[]>) {
      state.logs = action.payload;
      state.loading = false;
    },
    setTodayLogs(state, action: PayloadAction<SupplementLog[]>) {
      state.todayLogs = action.payload;
    },
    addLog(state, action: PayloadAction<SupplementLog>) {
      state.todayLogs.push(action.payload);
      state.logs.unshift(action.payload);
    },
    setStacks(state, action: PayloadAction<SupplementStack[]>) {
      state.stacks = action.payload;
    },
    setRecommendations(state, action: PayloadAction<any>) {
      state.recommendations = action.payload;
    },
    setAnalytics(state, action: PayloadAction<any>) {
      state.analytics = action.payload;
    },
    resetSupplements() {
      return initialState;
    },
  },
});

export const {
  setLoading, setError, setCatalog, setInventory, addToInventory,
  setLogs, setTodayLogs, addLog, setStacks, setRecommendations,
  setAnalytics, resetSupplements,
} = supplementsSlice.actions;

export default supplementsSlice.reducer;
