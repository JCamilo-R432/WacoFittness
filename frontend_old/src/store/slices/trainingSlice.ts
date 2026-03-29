import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { TrainingProfile, Exercise, WorkoutLog, PersonalRecord, TrainingProgress } from '../../types/models.types';

interface WorkoutSummary {
  workouts?: number;
  totalVolume?: number;
  volume?: { label: string; value: number }[];
  strength?: { label: string; value: number }[];
}

interface TrainingState {
  profile: TrainingProfile | null;
  exercises: Exercise[];
  searchedExercises: Exercise[];
  workouts: any[];
  workoutLogs: WorkoutLog[];
  activeWorkout: WorkoutLog | null;
  personalRecords: PersonalRecord[];
  weeklySummary: WorkoutSummary | null;
  prs: PersonalRecord[];
  progress: TrainingProgress[];
  recommendations: any | null;
  loading: boolean;
  error: string | null;
}

const initialState: TrainingState = {
  profile: null,
  exercises: [],
  searchedExercises: [],
  workouts: [],
  workoutLogs: [],
  activeWorkout: null,
  personalRecords: [],
  weeklySummary: null,
  prs: [],
  progress: [],
  recommendations: null,
  loading: false,
  error: null,
};

const trainingSlice = createSlice({
  name: 'training',
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
    setProfile(state, action: PayloadAction<TrainingProfile>) {
      state.profile = action.payload;
      state.loading = false;
    },
    setExercises(state, action: PayloadAction<Exercise[]>) {
      state.exercises = action.payload;
      state.loading = false;
    },
    setSearchedExercises(state, action: PayloadAction<Exercise[]>) {
      state.searchedExercises = action.payload;
    },
    setWorkouts(state, action: PayloadAction<any[]>) {
      state.workouts = action.payload;
      state.loading = false;
    },
    setWorkoutLogs(state, action: PayloadAction<WorkoutLog[]>) {
      state.workoutLogs = action.payload;
      state.loading = false;
    },
    addWorkoutLog(state, action: PayloadAction<WorkoutLog>) {
      state.workoutLogs.unshift(action.payload);
    },
    removeWorkoutLog(state, action: PayloadAction<string>) {
      state.workoutLogs = state.workoutLogs.filter((w) => w.id !== action.payload);
    },
    setActiveWorkout(state, action: PayloadAction<WorkoutLog | null>) {
      state.activeWorkout = action.payload;
    },
    setPersonalRecords(state, action: PayloadAction<PersonalRecord[]>) {
      state.personalRecords = action.payload;
      state.loading = false;
    },
    setWeeklySummary(state, action: PayloadAction<WorkoutSummary>) {
      state.weeklySummary = action.payload;
      state.loading = false;
    },
    setPRs(state, action: PayloadAction<PersonalRecord[]>) {
      state.prs = action.payload;
      state.loading = false;
    },
    setProgress(state, action: PayloadAction<TrainingProgress[]>) {
      state.progress = action.payload;
      state.loading = false;
    },
    setRecommendations(state, action: PayloadAction<any>) {
      state.recommendations = action.payload;
    },
    resetTraining() {
      return initialState;
    },
  },
});

export const {
  setLoading, setError, setProfile, setExercises, setSearchedExercises,
  setWorkouts, setWorkoutLogs, addWorkoutLog, removeWorkoutLog, setActiveWorkout,
  setPersonalRecords, setWeeklySummary, setPRs, setProgress, setRecommendations, resetTraining,
} = trainingSlice.actions;

export default trainingSlice.reducer;
