import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import type { TabParamList } from '../types/navigation.types';

import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { NutritionNavigator } from './NutritionNavigator';
import { TrainingNavigator } from './TrainingNavigator';
import { RestNavigator } from './RestNavigator';
import { ProfileNavigator } from './ProfileNavigator';

const Tab = createBottomTabNavigator<TabParamList>();

export const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ color, size }) => {
          const map: Record<string, string> = {
            DashboardTab: 'view-dashboard',
            NutritionTab: 'food-apple',
            TrainingTab: 'dumbbell',
            RestTab: 'sleep',
            ProfileTab: 'account-circle',
          };
          const iconName = map[route.name] ?? 'circle';
          return <Icon name={iconName} color={color} size={size} />;
        },
      })}
    >
      <Tab.Screen name="DashboardTab" component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name="NutritionTab" component={NutritionNavigator} options={{ title: 'Nutrición' }} />
      <Tab.Screen name="TrainingTab" component={TrainingNavigator} options={{ title: 'Entrenamiento' }} />
      <Tab.Screen name="RestTab" component={RestNavigator} options={{ title: 'Descanso' }} />
      <Tab.Screen name="ProfileTab" component={ProfileNavigator} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
};

