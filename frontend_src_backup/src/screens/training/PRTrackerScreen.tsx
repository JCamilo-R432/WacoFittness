import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import LineChart from '../../components/charts/LineChart';
import { useTraining } from '../../store/hooks/useTraining';

export const PRTrackerScreen = ({ navigation }: any) => {
  const { prs, loading, error, fetchPRs } = useTraining() as any;

  useEffect(() => {
    fetchPRs?.();
  }, []);

  const series = useMemo(() => {
    const arr = (prs ?? []).slice(-7);
    return arr.map((p: any) => ({ x: String(p.date ?? '').slice(5, 10) || '—', y: Number(p.weightKg ?? 0) }));
  }, [prs]);

  return (
    <Screen title="PR Tracker" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchPRs?.()} />}

      <Text style={{ marginBottom: 8, fontWeight: '800' }}>Evolución reciente (kg)</Text>
      <LineChart data={series} suffix="kg" />

      <View style={{ height: 16 }} />
      <List.Section>
        <List.Subheader>PRs</List.Subheader>
        {(prs ?? []).map((p: any) => (
          <List.Item
            key={p.id}
            title={p.exercise?.name ?? 'Ejercicio'}
            description={`${p.weightKg}kg x ${p.reps} · ${p.date}`}
            left={(props) => <List.Icon {...props} icon="trophy" />}
          />
        ))}
      </List.Section>
    </Screen>
  );
};

export default PRTrackerScreen;

