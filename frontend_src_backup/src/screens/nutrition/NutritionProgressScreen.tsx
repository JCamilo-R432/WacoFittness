import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import { useNutrition } from '../../store/hooks/useNutrition';

export const NutritionProgressScreen = ({ navigation }: any) => {
  const { progress, loading, error, fetchProgress } = useNutrition() as any;

  useEffect(() => {
    fetchProgress?.();
  }, []);

  const weightSeries = useMemo(
    () =>
      (progress ?? [])
        .slice(-7)
        .map((p: any) => ({ x: String(p.loggedDate).slice(5, 10), y: Number(p.weightKg ?? 0) })),
    [progress],
  );

  const caloriesSeries = useMemo(
    () =>
      (progress ?? [])
        .slice(-7)
        .map((p: any) => ({ x: String(p.loggedDate).slice(5, 10), y: Number(p.totalCalories ?? 0) })),
    [progress],
  );

  return (
    <Screen title="Progreso nutrición" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchProgress?.()} />}

      <Text style={{ marginBottom: 8, fontWeight: '800' }}>Peso corporal (7 días)</Text>
      <LineChart data={weightSeries} suffix="kg" />

      <View style={{ height: 16 }} />
      <Text style={{ marginBottom: 8, fontWeight: '800' }}>Calorías (7 días)</Text>
      <BarChart data={caloriesSeries} suffix="kcal" />
    </Screen>
  );
};

export default NutritionProgressScreen;

