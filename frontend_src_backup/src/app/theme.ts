import { MD3DarkTheme, MD3LightTheme, type MD3Theme } from 'react-native-paper';
import { COLORS } from '../utils/constants';

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    background: COLORS.background,
    surface: COLORS.surface,
    error: COLORS.danger,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: COLORS.primaryLight,
    secondary: COLORS.secondaryLight,
    background: COLORS.backgroundDark,
    surface: COLORS.surfaceDark,
    error: COLORS.danger,
  },
};

