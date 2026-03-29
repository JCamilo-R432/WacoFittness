import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { TrainingStackParamList } from '../types/navigation.types';

import { TrainingDashboard } from '../screens/training/TrainingDashboard';
import { WorkoutListScreen } from '../screens/training/WorkoutListScreen';
import { WorkoutDetailScreen } from '../screens/training/WorkoutDetailScreen';
import { WorkoutLogScreen } from '../screens/training/WorkoutLogScreen';
import { ExerciseLibraryScreen } from '../screens/training/ExerciseLibraryScreen';
import { PRTrackerScreen } from '../screens/training/PRTrackerScreen';
import { TrainingProgressScreen } from '../screens/training/TrainingProgressScreen';

const Stack = createNativeStackNavigator<TrainingStackParamList>();

export const TrainingNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TrainingDashboard" component={TrainingDashboard} />
      <Stack.Screen name="WorkoutList" component={WorkoutListScreen} />
      <Stack.Screen name="WorkoutDetail" component={WorkoutDetailScreen} />
      <Stack.Screen name="WorkoutLog" component={WorkoutLogScreen} />
      <Stack.Screen name="ExerciseLibrary" component={ExerciseLibraryScreen} />
      <Stack.Screen name="PRTracker" component={PRTrackerScreen} />
      <Stack.Screen name="TrainingProgress" component={TrainingProgressScreen} />
    </Stack.Navigator>
  );
};

