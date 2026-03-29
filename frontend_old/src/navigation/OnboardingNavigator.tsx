import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../types/navigation.types';

import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';
import { ProfileSetupScreen } from '../screens/onboarding/ProfileSetupScreen';
import { GoalsSetupScreen } from '../screens/onboarding/GoalsSetupScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export const OnboardingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileSetupScreen} />
      <Stack.Screen name="GoalsSetup" component={GoalsSetupScreen} />
    </Stack.Navigator>
  );
};

