import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import StatCard from '../../components/common/StatCard';
import LineChart from '../../components/charts/LineChart';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import Button from '../../components/ui/Button';
import { COLORS, SPACING } from '../../utils/constants';
import { useTraining } from '../../store/hooks/useTraining';

export const TrainingDashboard = ({ navigation }: any) => {
  const { weeklySummary, prs, loading, error, fetchWeeklySummary, fetchPRs } = useTraining() as any;

  useEffect(() => {
    fetchWeeklySummary?.();
    fetchPRs?.();
  }, []);

  const strengthSeries = useMemo(() => {
    const arr = weeklySummary?.strength ?? weeklySummary?.data ?? [];
    if (Array.isArray(arr) && arr.length) {
      return arr.slice(0, 7).map((p: any, i: number) => ({ x: p.label ?? `${i + 1}`, y: Number(p.value ?? 0) }));
    }
    return [
      { x: 'L', y: 0 },
      { x: 'M', y: 0 },
      { x: 'X', y: 0 },
      { x: 'J', y: 0 },
      { x: 'V', y: 0 },
      { x: 'S', y: 0 },
      { x: 'D', y: 0 },
    ];
  }, [weeklySummary]);

  return (
    <Screen title="Entrenamiento" rightIcon="playlist-edit" onRightPress={() => navigation.navigate('WorkoutList')}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => { fetchWeeklySummary?.(); fetchPRs?.(); }} />}

      <View style={styles.grid}>
        <StatCard
          title="Volumen semanal"
          value={weeklySummary?.totalVolume ?? 0}
          unit=""
          icon="chart-bar"
          color={COLORS.training}
        />
        <StatCard
          title="PRs recientes"
          value={prs?.length ?? 0}
          unit=""
          icon="trophy"
          color={COLORS.warning}
          onPress={() => navigation.navigate('PRTracker')}
        />
      </View>

      <View style={{ marginTop: SPACING.md }}>
        <Text style={styles.sectionTitle}>Progreso de fuerza</Text>
        <LineChart data={strengthSeries} height={220} />
      </View>

      <View style={{ marginTop: SPACING.md, gap: SPACING.sm }}>
        <Button title="Iniciar workout" onPress={() => navigation.navigate('WorkoutLog')} fullWidth icon="play" />
        <Button title="Biblioteca de ejercicios" onPress={() => navigation.navigate('ExerciseLibrary')} variant="outline" fullWidth icon="book-open-variant" />
        <Button title="Progreso" onPress={() => navigation.navigate('TrainingProgress')} variant="ghost" fullWidth icon="chart-line" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: SPACING.md },
  sectionTitle: { fontWeight: '800', color: COLORS.dark, marginBottom: SPACING.sm },
});

export default TrainingDashboard;

