import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { RestStackParamList } from '../types/navigation.types';

import { RestDashboard } from '../screens/rest/RestDashboard';
import { SleepLogScreen } from '../screens/rest/SleepLogScreen';
import { RelaxationScreen } from '../screens/rest/RelaxationScreen';
import { StretchingScreen } from '../screens/rest/StretchingScreen';
import { RecoveryScoreScreen } from '../screens/rest/RecoveryScoreScreen';

const Stack = createNativeStackNavigator<RestStackParamList>();

export const RestNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RestDashboard" component={RestDashboard} />
      <Stack.Screen name="SleepLog" component={SleepLogScreen} />
      <Stack.Screen name="Relaxation" component={RelaxationScreen} />
      <Stack.Screen name="Stretching" component={StretchingScreen} />
      <Stack.Screen name="RecoveryScore" component={RecoveryScoreScreen} />
    </Stack.Navigator>
  );
};

