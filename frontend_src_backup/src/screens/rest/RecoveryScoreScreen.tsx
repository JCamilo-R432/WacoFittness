import React, { useEffect, useMemo } from 'react';
import { View } from 'react-native';
import { Card, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import ProgressChart from '../../components/charts/ProgressChart';
import { useRest } from '../../store/hooks/useRest';
import { COLORS } from '../../utils/constants';

export const RecoveryScoreScreen = ({ navigation }: any) => {
  const { recoveryScore: recovery, loading, error, fetchRecovery } = useRest() as any;

  useEffect(() => {
    fetchRecovery?.();
  }, []);

  const score = useMemo(() => Number(recovery?.score ?? 0), [recovery]);

  return (
    <Screen title="Recovery score" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchRecovery?.()} />}

      <Card style={{ backgroundColor: COLORS.white, marginBottom: 12 }}>
        <Card.Title title={`Score: ${recovery?.score ?? 0}/100`} subtitle={recovery?.date} />
        <Card.Content>
          <ProgressChart value={score} maxValue={100} color={COLORS.accent} label="Recovery" showPercent />
          <View style={{ height: 12 }} />
          {(recovery?.recommendations ?? []).slice(0, 6).map((r: string, i: number) => (
            <Text key={`${i}-${r}`} style={{ marginBottom: 6 }}>
              - {r}
            </Text>
          ))}
        </Card.Content>
      </Card>
    </Screen>
  );
};

export default RecoveryScoreScreen;

