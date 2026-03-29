import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthNavigator } from './AuthNavigator';
import { useAuth } from '../store/hooks/useAuth';
import { useSelector } from 'react-redux';
import type { RootState } from '../app/store';
import type { RootStackParamList } from '../types/navigation.types';
import { OnboardingNavigator } from './OnboardingNavigator';
import { DrawerNavigator } from './DrawerNavigator';
import { WelcomeScreen } from '../screens/onboarding/WelcomeScreen';

const RootStack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  const { isAuthenticated } = useAuth();
  const hasCompletedOnboarding = useSelector(
    (s: RootState) => s.user.settings.hasCompletedOnboarding,
  );

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!isAuthenticated && (
        <>
          <RootStack.Screen name="Welcome" component={WelcomeScreen} />
          <RootStack.Screen name="Auth" component={AuthNavigator} />
        </>
      )}

      {isAuthenticated && !hasCompletedOnboarding && (
        <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
      )}

      {isAuthenticated && hasCompletedOnboarding && (
        <RootStack.Screen name="Main" component={DrawerNavigator} />
      )}
    </RootStack.Navigator>
  );
};

