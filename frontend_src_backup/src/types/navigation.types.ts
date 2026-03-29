import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// ─── Auth Stack ───────────────────────────────────
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  VerifyEmail: { email: string };
};

// ─── Onboarding Stack ─────────────────────────────
export type OnboardingStackParamList = {
  Welcome: undefined;
  ProfileSetup: undefined;
  GoalsSetup: undefined;
};

// ─── Nutrition Stack ──────────────────────────────
export type NutritionStackParamList = {
  NutritionDashboard: undefined;
  FoodSearch: { mealType?: string };
  MealLog: { date?: string };
  MealPlan: { planId?: string };
  RecipeList: undefined;
  RecipeDetail: { recipeId: string };
  NutritionProgress: undefined;
};

// ─── Training Stack ───────────────────────────────
export type TrainingStackParamList = {
  TrainingDashboard: undefined;
  WorkoutList: undefined;
  WorkoutDetail: { workoutId?: string; planDayId?: string };
  WorkoutLog: { trainingDayId?: string };
  ExerciseLibrary: undefined;
  PRTracker: undefined;
  TrainingProgress: undefined;
};

// ─── Rest Stack ───────────────────────────────────
export type RestStackParamList = {
  RestDashboard: undefined;
  SleepLog: undefined;
  Relaxation: undefined;
  Stretching: undefined;
  RecoveryScore: undefined;
};

// ─── Hydration Stack ──────────────────────────────
export type HydrationStackParamList = {
  HydrationDashboard: undefined;
  WaterLog: undefined;
};

// ─── Supplements Stack ────────────────────────────
export type SupplementsStackParamList = {
  SupplementsDashboard: undefined;
  SupplementInventory: undefined;
  SupplementLog: undefined;
  Stack: { stackId?: string };
};

// ─── Shopping Stack ───────────────────────────────
export type ShoppingStackParamList = {
  ShoppingDashboard: undefined;
  ShoppingList: { listId?: string };
  Pantry: undefined;
  PurchaseHistory: undefined;
};

// ─── Profile Stack ────────────────────────────────
export type ProfileStackParamList = {
  Profile: undefined;
  Settings: undefined;
  EditProfile: undefined;
  NotificationsSettings: undefined;
};

// ─── Tab Navigator ────────────────────────────────
export type TabParamList = {
  DashboardTab: undefined;
  NutritionTab: NavigatorScreenParams<NutritionStackParamList>;
  TrainingTab: NavigatorScreenParams<TrainingStackParamList>;
  RestTab: NavigatorScreenParams<RestStackParamList>;
  ProfileTab: NavigatorScreenParams<ProfileStackParamList>;
};

// ─── Drawer Navigator ─────────────────────────────
export type DrawerParamList = {
  MainTabs: NavigatorScreenParams<TabParamList>;
  Hydration: NavigatorScreenParams<HydrationStackParamList>;
  Supplements: NavigatorScreenParams<SupplementsStackParamList>;
  Shopping: NavigatorScreenParams<ShoppingStackParamList>;
  Notifications: undefined;
};

// ─── Root Stack ───────────────────────────────────
export type RootStackParamList = {
  Welcome: undefined;
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
  Main: NavigatorScreenParams<DrawerParamList>;
};

// ─── Screen Props shortcuts ───────────────────────
export type LoginScreenProps = NativeStackScreenProps<AuthStackParamList, 'Login'>;
export type RegisterScreenProps = NativeStackScreenProps<AuthStackParamList, 'Register'>;
export type ForgotPasswordScreenProps = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;
export type VerifyEmailScreenProps = NativeStackScreenProps<AuthStackParamList, 'VerifyEmail'>;

export type DashboardScreenProps = CompositeScreenProps<
  BottomTabScreenProps<TabParamList, 'DashboardTab'>,
  DrawerScreenProps<DrawerParamList>
>;
