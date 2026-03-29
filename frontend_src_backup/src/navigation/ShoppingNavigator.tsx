import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { ShoppingStackParamList } from '../types/navigation.types';

import { ShoppingDashboard } from '../screens/shopping/ShoppingDashboard';
import { ShoppingListScreen } from '../screens/shopping/ShoppingListScreen';
import { PantryScreen } from '../screens/shopping/PantryScreen';
import { PurchaseHistoryScreen } from '../screens/shopping/PurchaseHistoryScreen';

const Stack = createNativeStackNavigator<ShoppingStackParamList>();

export const ShoppingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="ShoppingDashboard" component={ShoppingDashboard} />
      <Stack.Screen name="ShoppingList" component={ShoppingListScreen} />
      <Stack.Screen name="Pantry" component={PantryScreen} />
      <Stack.Screen name="PurchaseHistory" component={PurchaseHistoryScreen} />
    </Stack.Navigator>
  );
};

