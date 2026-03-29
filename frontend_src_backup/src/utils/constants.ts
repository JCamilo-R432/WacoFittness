// ========================
// CONSTANTS & THEME TOKENS
// ========================

export const COLORS = {
  // Primary palette
  primary: '#6C63FF',
  primaryDark: '#5A52D5',
  primaryLight: '#8B85FF',
  primaryBg: '#EEF0FF',

  // Secondary palette
  secondary: '#FF6B6B',
  secondaryDark: '#E05555',
  secondaryLight: '#FF8A8A',

  // Accent
  accent: '#00D9A6',
  accentDark: '#00B88A',

  // Semantic
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#3B82F6',

  // Neutral
  dark: '#1A1A2E',
  darkGray: '#2D2D44',
  gray: '#6B7280',
  mediumGray: '#9CA3AF',
  lightGray: '#E5E7EB',
  lighterGray: '#F3F4F6',
  light: '#F9FAFB',
  white: '#FFFFFF',

  // Module colors
  nutrition: '#FF6B6B',
  training: '#6C63FF',
  rest: '#8B5CF6',
  hydration: '#06B6D4',
  supplements: '#F59E0B',
  shopping: '#10B981',
  notifications: '#EC4899',

  // Surface
  surface: '#FFFFFF',
  surfaceDark: '#1E1E30',
  background: '#F5F7FB',
  backgroundDark: '#0F0F1A',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.5)',
  overlayLight: 'rgba(0, 0, 0, 0.2)',
} as const;

export const DARK_COLORS = {
  ...COLORS,
  background: '#0F0F1A',
  surface: '#1E1E30',
  light: '#1E1E30',
  white: '#1E1E30',
  dark: '#FFFFFF',
  darkGray: '#E5E7EB',
  gray: '#9CA3AF',
  mediumGray: '#6B7280',
  lightGray: '#2D2D44',
  lighterGray: '#1A1A2E',
  primaryBg: '#1A1A3A',
} as const;

export const FONTS = {
  thin: 'Inter-Thin',
  light: 'Inter-Light',
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  extraBold: 'Inter-ExtraBold',
} as const;

export const FONT_SIZES = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 30,
  title: 36,
  hero: 48,
} as const;

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
} as const;

export const BORDER_RADIUS = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  full: 9999,
} as const;

export const SHADOWS = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
} as const;

export const MEAL_TYPES = [
  { id: 'breakfast', label: 'Desayuno', icon: 'weather-sunny', color: '#FFA726' },
  { id: 'morningSnack', label: 'Media Mañana', icon: 'food-apple', color: '#66BB6A' },
  { id: 'lunch', label: 'Almuerzo', icon: 'food', color: '#EF5350' },
  { id: 'afternoonSnack', label: 'Merienda', icon: 'cookie', color: '#AB47BC' },
  { id: 'dinner', label: 'Cena', icon: 'weather-night', color: '#42A5F5' },
  { id: 'beforeBed', label: 'Antes de Dormir', icon: 'bed', color: '#8D6E63' },
] as const;

export const WORKOUT_SPLITS = [
  { id: 'fullbody', label: 'Full Body', icon: 'human' },
  { id: 'upperLower', label: 'Upper/Lower', icon: 'human-handsup' },
  { id: 'pushPullLegs', label: 'Push/Pull/Legs', icon: 'dumbbell' },
  { id: 'broSplit', label: 'Bro Split', icon: 'arm-flex' },
  { id: 'powerbuilding', label: 'Powerbuilding', icon: 'weight-lifter' },
] as const;

export const MUSCLE_GROUPS = [
  { id: 'chest', label: 'Pecho', icon: 'human-male' },
  { id: 'back', label: 'Espalda', icon: 'human-male' },
  { id: 'legs', label: 'Piernas', icon: 'human-male' },
  { id: 'shoulders', label: 'Hombros', icon: 'human-male' },
  { id: 'arms', label: 'Brazos', icon: 'arm-flex' },
  { id: 'core', label: 'Core', icon: 'human-male' },
  { id: 'cardio', label: 'Cardio', icon: 'run' },
] as const;

export const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Principiante', description: '0-1 años' },
  { id: 'intermediate', label: 'Intermedio', description: '1-3 años' },
  { id: 'advanced', label: 'Avanzado', description: '3-5 años' },
  { id: 'elite', label: 'Elite', description: '5+ años' },
] as const;

export const GOALS = [
  { id: 'muscleGain', label: 'Ganar Músculo', icon: 'arm-flex', color: '#6C63FF' },
  { id: 'fatLoss', label: 'Perder Grasa', icon: 'fire', color: '#FF6B6B' },
  { id: 'maintenance', label: 'Mantenimiento', icon: 'scale-balance', color: '#10B981' },
  { id: 'strength', label: 'Fuerza', icon: 'dumbbell', color: '#F59E0B' },
  { id: 'endurance', label: 'Resistencia', icon: 'run', color: '#06B6D4' },
] as const;

export const LIQUID_TYPES = [
  { id: 'water', label: 'Agua', icon: 'water', factor: 1.0, color: '#06B6D4' },
  { id: 'coffee', label: 'Café', icon: 'coffee', factor: 0.8, color: '#8D6E63' },
  { id: 'tea', label: 'Té', icon: 'tea', factor: 0.9, color: '#66BB6A' },
  { id: 'juice', label: 'Jugo', icon: 'cup', factor: 0.85, color: '#FFA726' },
  { id: 'sports', label: 'Bebida Deportiva', icon: 'bottle-tonic', factor: 1.1, color: '#42A5F5' },
  { id: 'milk', label: 'Leche', icon: 'cup', factor: 0.9, color: '#F5F5F5' },
] as const;

export const SUPPLEMENT_TIMINGS = [
  { id: 'morning', label: 'Mañana', icon: 'weather-sunny' },
  { id: 'preWorkout', label: 'Pre-Entreno', icon: 'lightning-bolt' },
  { id: 'postWorkout', label: 'Post-Entreno', icon: 'check-circle' },
  { id: 'withMeal', label: 'Con Comida', icon: 'food' },
  { id: 'beforeBed', label: 'Antes de Dormir', icon: 'bed' },
] as const;

export const NOTIFICATION_CATEGORIES = [
  { id: 'nutrition', label: 'Nutrición', icon: 'food-apple' },
  { id: 'training', label: 'Entrenamiento', icon: 'dumbbell' },
  { id: 'hydration', label: 'Hidratación', icon: 'water' },
  { id: 'rest', label: 'Descanso', icon: 'bed' },
  { id: 'supplements', label: 'Suplementos', icon: 'pill' },
  { id: 'shopping', label: 'Compras', icon: 'cart' },
  { id: 'general', label: 'General', icon: 'bell' },
] as const;

export const API_BASE_URL = 'http://192.168.1.100:3000/api';

export const ANIMATION_DURATION = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
