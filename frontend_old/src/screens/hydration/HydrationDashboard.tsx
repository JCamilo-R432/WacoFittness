import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import ProgressChart from '../../components/charts/ProgressChart';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { COLORS, SPACING } from '../../utils/constants';
import { useHydration } from '../../store/hooks/useHydration';

export const HydrationDashboard = ({ navigation }: any) => {
  const { goal, todayTotal, todayLogs, loading, error, fetchGoal, fetchTodayLogs, quickAdd } = useHydration() as any;

  useEffect(() => {
    fetchGoal?.();
    fetchTodayLogs?.();
  }, []);

  const consumed = Number(todayTotal ?? 0);
  const target = Number(goal?.dailyGoalMl ?? 2000);

  return (
    <Screen title="Hidratación" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => { fetchGoal?.(); fetchTodayLogs?.(); }} />}

      <View style={styles.center}>
        <ProgressChart value={consumed} maxValue={target} color={COLORS.hydration} label="Hoy" unit="ml" />
        <Text style={styles.subtitle}>{consumed} / {target} ml</Text>
      </View>

      <View style={styles.row}>
        {[250, 500, 750, 1000].map((ml) => (
          <Button key={ml} title={`+${ml}ml`} onPress={() => quickAdd?.(ml)} variant="outline" />
        ))}
      </View>

      <View style={{ marginTop: SPACING.md }}>
        <Button title="Ver registro" onPress={() => navigation.navigate('WaterLog')} fullWidth icon="format-list-bulleted" />
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: SPACING.sm },
  subtitle: { color: COLORS.gray },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginTop: SPACING.md },
});

export default HydrationDashboard;

