import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text, Chip } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useTraining } from '../../store/hooks/useTraining';

export const WorkoutListScreen = ({ navigation }: any) => {
  const { workouts, loading, error, fetchWorkouts } = useTraining() as any;

  useEffect(() => {
    fetchWorkouts?.();
  }, []);

  return (
    <Screen title="Rutinas" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchWorkouts?.()} />}

      {!workouts?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay rutinas disponibles.</Text>
        </View>
      ) : (
        <List.Section>
          {workouts.map((w: any) => (
            <List.Item
              key={w.id}
              title={w.name ?? 'Rutina'}
              description={w.description}
              left={(p) => <List.Icon {...p} icon="clipboard-text" />}
              right={() => <Chip compact>{w.difficulty ?? '—'}</Chip>}
              onPress={() => navigation.navigate('WorkoutDetail', { workoutId: w.id })}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default WorkoutListScreen;

