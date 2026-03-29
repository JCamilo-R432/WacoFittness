import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { SPACING, COLORS } from '../../utils/constants';
import { useTraining } from '../../store/hooks/useTraining';

export const WorkoutLogScreen = ({ navigation }: any) => {
  const { loading, error, logWorkout } = useTraining() as any;
  const [exerciseId, setExerciseId] = useState('');
  const [sets, setSets] = useState('3');
  const [reps, setReps] = useState('8');
  const [weightKg, setWeightKg] = useState('20');

  const payload = useMemo(
    () => ({
      workoutDate: new Date().toISOString().slice(0, 10),
      startTime: new Date().toISOString(),
      exercises: [
        {
          exerciseId,
          sets: Number(sets || 0),
          repsCompleted: reps,
          weightKg: Number(weightKg || 0),
        },
      ].filter((e) => !!e.exerciseId),
    }),
    [exerciseId, sets, reps, weightKg],
  );

  const onFinish = async () => {
    await logWorkout?.(payload);
    navigation.goBack();
  };

  return (
    <Screen title="Registro de workout" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => {}} />}

      <Text style={styles.helper}>
        Registro rápido (demo). Enlaza aquí tu “workout plan/day” real y lista de ejercicios del backend.
      </Text>

      <Input label="Exercise ID" value={exerciseId} onChangeText={setExerciseId} placeholder="uuid..." icon="identifier" />
      <View style={styles.row}>
        <View style={styles.col}>
          <Input label="Series" value={sets} onChangeText={setSets} keyboardType="numeric" icon="format-list-numbered" />
        </View>
        <View style={styles.col}>
          <Input label="Reps" value={reps} onChangeText={setReps} keyboardType="default" icon="repeat" />
        </View>
      </View>
      <Input label="Peso (kg)" value={weightKg} onChangeText={setWeightKg} keyboardType="numeric" icon="weight-kilogram" />

      <Button
        title="Finalizar workout"
        onPress={onFinish}
        fullWidth
        icon="check"
        disabled={!payload.exercises.length}
      />
    </Screen>
  );
};

const styles = StyleSheet.create({
  helper: { color: COLORS.gray, marginBottom: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.md },
  col: { flex: 1 },
});

export default WorkoutLogScreen;

