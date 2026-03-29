import React, { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Card } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import StatCard from '../../components/common/StatCard';
import PieChart from '../../components/charts/PieChart';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import Button from '../../components/ui/Button';
import { COLORS, SPACING } from '../../utils/constants';
import { useNutrition } from '../../store/hooks/useNutrition';

export const NutritionDashboard = ({ navigation }: any) => {
  const {
    dailySummary,
    dailyLogs,
    loading,
    error,
    fetchDailyLogs,
    fetchDailySummary,
    fetchFrequentFoods,
  } = useNutrition() as any;

  useEffect(() => {
    fetchDailySummary?.();
    fetchDailyLogs?.();
    fetchFrequentFoods?.();
  }, []);

  const macroData = useMemo(() => {
    const p = Number(dailySummary?.totalProteinG ?? 0);
    const c = Number(dailySummary?.totalCarbsG ?? 0);
    const f = Number(dailySummary?.totalFatG ?? 0);
    return [
      { name: 'Prote', value: p, color: COLORS.success },
      { name: 'Carbs', value: c, color: COLORS.info },
      { name: 'Grasas', value: f, color: COLORS.warning },
    ];
  }, [dailySummary]);

  return (
    <Screen
      title="Nutrición"
      rightIcon="magnify"
      onRightPress={() => navigation.navigate('FoodSearch')}
    >
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => { fetchDailySummary?.(); fetchDailyLogs?.(); }} />}

      <View style={styles.grid}>
        <StatCard
          title="Calorías hoy"
          value={dailySummary?.totalCalories ?? 0}
          unit="kcal"
          icon="fire"
          color={COLORS.nutrition}
        />
        <StatCard
          title="Comidas"
          value={dailyLogs?.length ?? 0}
          unit=""
          icon="silverware-fork-knife"
          color={COLORS.secondary}
          onPress={() => navigation.navigate('MealLog')}
        />
      </View>

      <Card style={styles.card}>
        <Card.Title title="Macros del día" />
        <Card.Content>
          <PieChart data={macroData as any} />
        </Card.Content>
      </Card>

      <View style={styles.actions}>
        <Button
          title="Registrar comida"
          onPress={() => navigation.navigate('MealLog')}
          icon="plus"
          fullWidth
        />
        <Button
          title="Plan de comidas"
          onPress={() => navigation.navigate('MealPlan')}
          variant="outline"
          icon="calendar"
          fullWidth
        />
        <Button
          title="Recetas"
          onPress={() => navigation.navigate('RecipeList')}
          variant="outline"
          icon="chef-hat"
          fullWidth
        />
        <Button
          title="Progreso"
          onPress={() => navigation.navigate('NutritionProgress')}
          variant="ghost"
          icon="chart-line"
          fullWidth
        />
      </View>

      <View style={{ marginTop: SPACING.lg }}>
        <Text style={styles.sectionTitle}>Últimas comidas</Text>
        {(dailyLogs ?? []).slice(0, 5).map((log: any) => (
          <Card key={log.id} style={styles.logCard} onPress={() => navigation.navigate('MealLog')}>
            <Card.Content>
              <Text style={{ fontWeight: '700' }}>{log.foodItem?.name ?? 'Comida'}</Text>
              <Text style={{ color: COLORS.gray }}>
                {log.mealType} · {log.quantityG}g · {Math.round(log.calories ?? 0)} kcal
              </Text>
            </Card.Content>
          </Card>
        ))}
        {!dailyLogs?.length && <Text style={{ color: COLORS.gray }}>Aún no registraste comidas hoy.</Text>}
      </View>
    </Screen>
  );
};

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', gap: SPACING.md },
  card: { marginTop: SPACING.md, backgroundColor: COLORS.white },
  actions: { marginTop: SPACING.md, gap: SPACING.sm },
  sectionTitle: { fontWeight: '800', color: COLORS.dark, marginBottom: SPACING.sm },
  logCard: { marginBottom: SPACING.sm, backgroundColor: COLORS.white },
});

export default NutritionDashboard;

