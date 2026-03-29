import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import StatCard from '../../components/common/StatCard';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import Button from '../../components/ui/Button';
import { COLORS, SPACING } from '../../utils/constants';
import { useRest } from '../../store/hooks/useRest';

export const RestDashboard = ({ navigation }: any) => {
  const { lastSleep, recoveryScore, loading, error, fetchLatest, fetchRecovery } = useRest() as any;

  useEffect(() => {
    fetchLatest?.();
    fetchRecovery?.();
  }, []);

  return (
    <Screen title="Descanso">
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => { fetchLatest?.(); fetchRecovery?.(); }} />}

      <View style={styles.grid}>
        <StatCard
          title="Sueño anoche"
          value={lastSleep?.durationHours ?? 0}
          unit="h"
          icon="sleep"
          color={COLORS.rest}
          onPress={() => navigation.navigate('SleepLog')}
        />
        <StatCard
          title="Recovery score"
          value={recoveryScore?.score ?? 0}
          unit="/100"
          icon="heart-pulse"
          color={COLORS.accent}
          onPress={() => navigation.navigate('RecoveryScore')}
        />
      </View>

      <View style={{ marginTop: SPACING.md, gap: SPACING.sm }}>
        <Button title="Registrar sueño" onPress={() => navigation.navigate('SleepLog')} fullWidth icon="plus" />
        <Button title="Relajación" onPress={() => navigation.navigate('Relaxation')} variant="outline" fullWidth icon="meditation" />
        <Button title="Estiramientos" onPress={() => navigation.navigate('Stretching')} variant="outline" fullWidth icon="yoga" />
      </View>

      <Text style={styles.tip}>
        Tip: prioriza 7-9h, constancia en horarios y exposición a luz natural por la mañana.
      </Text>
    </Screen>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: SPACING.md },
  tip: { marginTop: SPACING.lg, color: COLORS.gray },
});

export default RestDashboard;

