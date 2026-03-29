import type { LinkingOptions } from '@react-navigation/native';
import type { RootStackParamList } from '../types/navigation.types';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['muscleapp://', 'https://muscleapp.local'],
  config: {
    screens: {
      Welcome: 'welcome',
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          VerifyEmail: 'verify-email',
        },
      },
      Main: {
        screens: {
          MainTabs: {
            screens: {
              DashboardTab: 'dashboard',
              NutritionTab: {
                screens: {
                  NutritionDashboard: 'nutrition',
                  FoodSearch: 'nutrition/foods',
                  MealLog: 'nutrition/meal-log',
                  MealPlan: 'nutrition/meal-plan',
                  RecipeList: 'nutrition/recipes',
                  RecipeDetail: 'nutrition/recipes/:recipeId',
                  NutritionProgress: 'nutrition/progress',
                },
              },
              TrainingTab: {
                screens: {
                  TrainingDashboard: 'training',
                  WorkoutList: 'training/workouts',
                  WorkoutDetail: 'training/workouts/:workoutId',
                  WorkoutLog: 'training/workout-log',
                  ExerciseLibrary: 'training/exercises',
                  PRTracker: 'training/prs',
                  TrainingProgress: 'training/progress',
                },
              },
              RestTab: {
                screens: {
                  RestDashboard: 'rest',
                  SleepLog: 'rest/sleep-log',
                  Relaxation: 'rest/relaxation',
                  Stretching: 'rest/stretching',
                  RecoveryScore: 'rest/recovery',
                },
              },
              ProfileTab: {
                screens: {
                  Profile: 'profile',
                  Settings: 'profile/settings',
                  EditProfile: 'profile/edit',
                  NotificationsSettings: 'profile/notifications',
                },
              },
            },
          },
          Hydration: {
            screens: {
              HydrationDashboard: 'hydration',
              WaterLog: 'hydration/log',
            },
          },
          Supplements: {
            screens: {
              SupplementsDashboard: 'supplements',
              SupplementInventory: 'supplements/inventory',
              SupplementLog: 'supplements/log',
              Stack: 'supplements/stacks',
            },
          },
          Shopping: {
            screens: {
              ShoppingDashboard: 'shopping',
              ShoppingList: 'shopping/lists',
              Pantry: 'shopping/pantry',
              PurchaseHistory: 'shopping/history',
            },
          },
          Notifications: 'notifications',
        },
      },
      Onboarding: {
        screens: {
          Welcome: 'onboarding',
          ProfileSetup: 'onboarding/profile',
          GoalsSetup: 'onboarding/goals',
        },
      },
    },
  },
};

