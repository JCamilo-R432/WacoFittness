import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Card, List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import Button from '../../components/ui/Button';
import { trainingService } from '../../services/trainingService';
import { COLORS } from '../../utils/constants';

export const WorkoutDetailScreen = ({ navigation, route }: any) => {
  const workoutId = route.params?.workoutId as string | undefined;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workout, setWorkout] = useState<any>(null);

  useEffect(() => {
    if (!workoutId) {
      setLoading(false);
      setWorkout(null);
      return;
    }
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await trainingService.getWorkoutById(workoutId);
        setWorkout(res.data);
      } catch (e: any) {
        setError(e.message ?? 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [workoutId]);

  return (
    <Screen title="Detalle rutina" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => navigation.replace('WorkoutDetail', { workoutId })} />}

      {!workoutId && (
        <View style={{ padding: 16 }}>
          <Text>Selecciona una rutina desde la lista.</Text>
        </View>
      )}

      {workout && (
        <>
          <Card style={{ marginBottom: 12, backgroundColor: COLORS.white }}>
            <Card.Title title={workout.name ?? 'Rutina'} subtitle={workout.description} />
            <Card.Content>
              <Text style={{ color: COLORS.gray }}>
                {workout.daysPerWeek ? `${workout.daysPerWeek} días/semana · ` : ''}
                {workout.goal ?? ''}
              </Text>
            </Card.Content>
          </Card>

          <List.Section>
            <List.Subheader>Ejercicios</List.Subheader>
            {(workout.exercises ?? []).map((ex: any) => (
              <List.Item
                key={ex.id ?? `${ex.exerciseId}-${ex.order}`}
                title={ex.exercise?.name ?? ex.name ?? 'Ejercicio'}
                description={`${ex.sets ?? 0} series · ${ex.reps ?? ex.repsRange ?? ''}`}
                left={(p) => <List.Icon {...p} icon="dumbbell" />}
              />
            ))}
          </List.Section>

          <Button title="Iniciar workout" onPress={() => navigation.navigate('WorkoutLog', { trainingDayId: workout.id })} fullWidth icon="play" />
        </>
      )}
    </Screen>
  );
};

export default WorkoutDetailScreen;

