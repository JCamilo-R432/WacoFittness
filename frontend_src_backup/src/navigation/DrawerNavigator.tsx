import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import type { DrawerParamList } from '../types/navigation.types';

import { TabNavigator } from './TabNavigator';
import { HydrationNavigator } from './HydrationNavigator';
import { SupplementsNavigator } from './SupplementsNavigator';
import { ShoppingNavigator } from './ShoppingNavigator';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';

const Drawer = createDrawerNavigator<DrawerParamList>();

export const DrawerNavigator = () => {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
      <Drawer.Screen name="MainTabs" component={TabNavigator} />
      <Drawer.Screen name="Hydration" component={HydrationNavigator} />
      <Drawer.Screen name="Supplements" component={SupplementsNavigator} />
      <Drawer.Screen name="Shopping" component={ShoppingNavigator} />
      <Drawer.Screen name="Notifications" component={NotificationsScreen} />
    </Drawer.Navigator>
  );
};

