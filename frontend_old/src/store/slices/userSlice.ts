import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  units: { weight: 'kg' | 'lb'; height: 'cm' | 'ft'; volume: 'ml' | 'oz' };
  biometricsEnabled: boolean;
  hasCompletedOnboarding: boolean;
}

interface UserState {
  settings: UserSettings;
  loading: boolean;
  error: string | null;
}

const initialState: UserState = {
  settings: {
    theme: 'light',
    language: 'es',
    units: { weight: 'kg', height: 'cm', volume: 'ml' },
    biometricsEnabled: false,
    hasCompletedOnboarding: false,
  },
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setSettings(state, action: PayloadAction<Partial<UserSettings>>) {
      state.settings = { ...state.settings, ...action.payload };
    },
    setTheme(state, action: PayloadAction<'light' | 'dark' | 'system'>) {
      state.settings.theme = action.payload;
    },
    setLanguage(state, action: PayloadAction<string>) {
      state.settings.language = action.payload;
    },
    setUnits(state, action: PayloadAction<Partial<UserSettings['units']>>) {
      state.settings.units = { ...state.settings.units, ...action.payload };
    },
    setBiometrics(state, action: PayloadAction<boolean>) {
      state.settings.biometricsEnabled = action.payload;
    },
    setOnboardingCompleted(state) {
      state.settings.hasCompletedOnboarding = true;
    },
    resetUser() {
      return initialState;
    },
  },
});

export const {
  setSettings, setTheme, setLanguage, setUnits,
  setBiometrics, setOnboardingCompleted, resetUser,
} = userSlice.actions;

export default userSlice.reducer;
