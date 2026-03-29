import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { NutritionStackParamList } from '../types/navigation.types';

import { NutritionDashboard } from '../screens/nutrition/NutritionDashboard';
import { FoodSearchScreen } from '../screens/nutrition/FoodSearchScreen';
import { MealLogScreen } from '../screens/nutrition/MealLogScreen';
import { MealPlanScreen } from '../screens/nutrition/MealPlanScreen';
import { RecipeListScreen } from '../screens/nutrition/RecipeListScreen';
import { RecipeDetailScreen } from '../screens/nutrition/RecipeDetailScreen';
import { NutritionProgressScreen } from '../screens/nutrition/NutritionProgressScreen';

const Stack = createNativeStackNavigator<NutritionStackParamList>();

export const NutritionNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="NutritionDashboard" component={NutritionDashboard} />
      <Stack.Screen name="FoodSearch" component={FoodSearchScreen} />
      <Stack.Screen name="MealLog" component={MealLogScreen} />
      <Stack.Screen name="MealPlan" component={MealPlanScreen} />
      <Stack.Screen name="RecipeList" component={RecipeListScreen} />
      <Stack.Screen name="RecipeDetail" component={RecipeDetailScreen} />
      <Stack.Screen name="NutritionProgress" component={NutritionProgressScreen} />
    </Stack.Navigator>
  );
};

