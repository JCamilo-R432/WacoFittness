import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { HydrationStackParamList } from '../types/navigation.types';

import { HydrationDashboard } from '../screens/hydration/HydrationDashboard';
import { WaterLogScreen } from '../screens/hydration/WaterLogScreen';

const Stack = createNativeStackNavigator<HydrationStackParamList>();

export const HydrationNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HydrationDashboard" component={HydrationDashboard} />
      <Stack.Screen name="WaterLog" component={WaterLogScreen} />
    </Stack.Navigator>
  );
};

