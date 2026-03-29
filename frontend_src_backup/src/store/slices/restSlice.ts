import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { SleepLog, RecoveryScore, StressLog, RelaxationTechnique, StretchingRoutine } from '../../types/models.types';

interface RestState {
  sleepLogs: SleepLog[];
  lastSleep: SleepLog | null;
  recoveryScore: RecoveryScore | null;
  stressLogs: StressLog[];
  techniques: RelaxationTechnique[];
  routines: StretchingRoutine[];
  relaxationHistory: any[];
  stretchingHistory: any[];
  loading: boolean;
  error: string | null;
}

const initialState: RestState = {
  sleepLogs: [],
  lastSleep: null,
  recoveryScore: null,
  stressLogs: [],
  techniques: [],
  routines: [],
  relaxationHistory: [],
  stretchingHistory: [],
  loading: false,
  error: null,
};

const restSlice = createSlice({
  name: 'rest',
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
    setSleepLogs(state, action: PayloadAction<SleepLog[]>) {
      state.sleepLogs = action.payload;
      state.loading = false;
    },
    addSleepLog(state, action: PayloadAction<SleepLog>) {
      state.sleepLogs.unshift(action.payload);
      state.lastSleep = action.payload;
    },
    setLastSleep(state, action: PayloadAction<SleepLog | null>) {
      state.lastSleep = action.payload;
    },
    setRecoveryScore(state, action: PayloadAction<RecoveryScore>) {
      state.recoveryScore = action.payload;
      state.loading = false;
    },
    setTechniques(state, action: PayloadAction<RelaxationTechnique[]>) {
      state.techniques = action.payload;
      state.loading = false;
    },
    setRoutines(state, action: PayloadAction<StretchingRoutine[]>) {
      state.routines = action.payload;
      state.loading = false;
    },
    setStressLogs(state, action: PayloadAction<StressLog[]>) {
      state.stressLogs = action.payload;
    },
    addStressLog(state, action: PayloadAction<StressLog>) {
      state.stressLogs.unshift(action.payload);
    },
    setRelaxationHistory(state, action: PayloadAction<any[]>) {
      state.relaxationHistory = action.payload;
    },
    setStretchingHistory(state, action: PayloadAction<any[]>) {
      state.stretchingHistory = action.payload;
    },
    resetRest() {
      return initialState;
    },
  },
});

export const {
  setLoading, setError, setSleepLogs, addSleepLog, setLastSleep,
  setRecoveryScore, setStressLogs, addStressLog,
  setTechniques, setRoutines, setRelaxationHistory, setStretchingHistory, resetRest,
} = restSlice.actions;

export default restSlice.reducer;
