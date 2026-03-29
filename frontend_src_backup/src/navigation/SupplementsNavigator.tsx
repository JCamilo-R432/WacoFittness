import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { SupplementsStackParamList } from '../types/navigation.types';

import { SupplementsDashboard } from '../screens/supplements/SupplementsDashboard';
import { SupplementInventoryScreen } from '../screens/supplements/SupplementInventoryScreen';
import { SupplementLogScreen } from '../screens/supplements/SupplementLogScreen';
import { StackScreen } from '../screens/supplements/StackScreen';

const Stack = createNativeStackNavigator<SupplementsStackParamList>();

export const SupplementsNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SupplementsDashboard" component={SupplementsDashboard} />
      <Stack.Screen name="SupplementInventory" component={SupplementInventoryScreen} />
      <Stack.Screen name="SupplementLog" component={SupplementLogScreen} />
      <Stack.Screen name="Stack" component={StackScreen} />
    </Stack.Navigator>
  );
};

