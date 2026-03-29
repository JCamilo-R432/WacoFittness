import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import SafeArea from '../../components/layout/SafeArea';
import Container from '../../components/layout/Container';
import Header from '../../components/layout/Header';
import StatCard from '../../components/common/StatCard';
import LineChart from '../../components/charts/LineChart';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';

import { COLORS, SPACING } from '../../utils/constants';
import { useNutrition } from '../../store/hooks/useNutrition';
import { useTraining } from '../../store/hooks/useTraining';
import { useRest } from '../../store/hooks/useRest';
import { useHydration } from '../../store/hooks/useHydration';
import { useSupplements } from '../../store/hooks/useSupplements';

export const DashboardScreen = ({ navigation }: any) => {
  const nutrition = useNutrition();
  const training = useTraining();
  const rest = useRest();
  const hydration = useHydration();
  const supplements = useSupplements();

  useEffect(() => {
    // Best-effort fetches (each hook handles its own errors)
    nutrition.fetchDailySummary?.();
    hydration.fetchGoal?.();
    hydration.fetchTodayLogs?.();
    training.fetchWeeklySummary?.();
    rest.fetchLatest?.();
    supplements.fetchToday?.();
  }, []);

  const weeklyData = useMemo(() => {
    const points = (training.weeklySummary?.volume ?? training.weeklySummary?.data ?? []).slice?.(0, 7) ?? [];
    if (Array.isArray(points) && points.length) {
      return points.map((p: any, idx: number) => ({ x: p.day ?? `${idx + 1}`, y: Number(p.value ?? p.volume ?? 0) }));
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
  }, [training.weeklySummary]);

  const anyLoading =
    nutrition.loading || training.loading || rest.loading || hydration.loading || supplements.loading;
  const anyError =
    nutrition.error || training.error || rest.error || hydration.error || supplements.error;

  return (
    <SafeArea>
      <Header
        title="Dashboard"
        rightIcon="menu"
        onRightPress={() => navigation.getParent?.()?.openDrawer?.()}
      />
      <Container>
        {anyLoading && <Loading message="Cargando resumen..." />}
        {anyError && (
          <ErrorView
            message={anyError}
            onRetry={() => {
              nutrition.fetchDailySummary?.();
              hydration.fetchGoal?.();
              hydration.fetchTodayLogs?.();
              training.fetchWeeklySummary?.();
              rest.fetchLatest?.();
              supplements.fetchToday?.();
            }}
          />
        )}

        <View style={styles.grid}>
          <StatCard
            title="Calorías"
            value={nutrition.dailySummary?.totalCalories ?? 0}
            unit="kcal"
            icon="fire"
            color={COLORS.nutrition}
            onPress={() => navigation.navigate('NutritionTab')}
          />
          <StatCard
            title="Entrenos semana"
            value={training.weeklySummary?.workouts ?? training.weeklySummary?.count ?? 0}
            unit=""
            icon="dumbbell"
            color={COLORS.training}
            onPress={() => navigation.navigate('TrainingTab')}
          />
          <StatCard
            title="Sueño"
            value={rest.lastSleep?.durationHours ?? 0}
            unit="h"
            icon="sleep"
            color={COLORS.rest}
            onPress={() => navigation.navigate('RestTab')}
          />
          <StatCard
            title="Agua"
            value={hydration.todayTotal ?? 0}
            unit="ml"
            icon="water"
            color={COLORS.hydration}
            onPress={() => navigation.getParent?.()?.navigate?.('Hydration')}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Icon name="chart-line" size={20} color={COLORS.primary} />
            <Text style={styles.sectionTitle}>Progreso semanal</Text>
          </View>
          <LineChart data={weeklyData} height={220} />
        </View>
      </Container>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    justifyContent: 'space-between',
  },
  section: {
    marginTop: SPACING.lg,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.md,
  },
  sectionTitleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  sectionTitle: { fontWeight: '700', color: COLORS.dark },
});

export default DashboardScreen;

