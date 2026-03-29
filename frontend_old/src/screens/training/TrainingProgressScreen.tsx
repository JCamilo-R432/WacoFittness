import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import BarChart from '../../components/charts/BarChart';
import LineChart from '../../components/charts/LineChart';
import { useTraining } from '../../store/hooks/useTraining';

export const TrainingProgressScreen = ({ navigation }: any) => {
  const { progress, weeklySummary, loading, error, fetchProgress, fetchWeeklySummary } = useTraining() as any;

  useEffect(() => {
    fetchProgress?.();
    fetchWeeklySummary?.();
  }, []);

  const volumeSeries = useMemo(() => {
    const arr = weeklySummary?.volume ?? [];
    if (Array.isArray(arr) && arr.length) {
      return arr.slice(-7).map((p: any, i: number) => ({ x: p.label ?? `${i + 1}`, y: Number(p.value ?? 0) }));
    }
    return [];
  }, [weeklySummary]);

  const oneRMSeries = useMemo(() => {
    const arr = (progress ?? []).slice(-7);
    return arr.map((p: any) => ({ x: String(p.loggedDate ?? '').slice(5, 10) || '—', y: Number(p.oneRepMax ?? p.estimatedOneRepMax ?? 0) }));
  }, [progress]);

  return (
    <Screen title="Progreso" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => { fetchProgress?.(); fetchWeeklySummary?.(); }} />}

      <Text style={{ marginBottom: 8, fontWeight: '800' }}>Volumen semanal</Text>
      <BarChart data={volumeSeries} />

      <View style={{ height: 16 }} />
      <Text style={{ marginBottom: 8, fontWeight: '800' }}>Fuerza (1RM estimado)</Text>
      <LineChart data={oneRMSeries} suffix="kg" />
    </Screen>
  );
};

export default TrainingProgressScreen;

