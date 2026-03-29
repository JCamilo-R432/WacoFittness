import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import Button from '../../components/ui/Button';
import { useNutrition } from '../../store/hooks/useNutrition';

export const MealPlanScreen = ({ navigation }: any) => {
  const { mealPlans, loading, error, fetchMealPlans } = useNutrition() as any;

  useEffect(() => {
    fetchMealPlans?.();
  }, []);

  return (
    <Screen title="Plan de comidas" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchMealPlans?.()} />}

      <Button
        title="Generar plan (demo)"
        onPress={() => fetchMealPlans?.()}
        icon="auto-fix"
        fullWidth
      />

      {!mealPlans?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay planes todavía.</Text>
        </View>
      ) : (
        <List.Section>
          {mealPlans.map((p: any) => (
            <List.Item
              key={p.id}
              title={p.name ?? 'Plan'}
              description={`${p.durationDays ?? 0} días · ${p.isActive ? 'Activo' : 'Inactivo'}`}
              left={(props) => <List.Icon {...props} icon="calendar" />}
              onPress={() => navigation.navigate('MealPlan', { planId: p.id })}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default MealPlanScreen;

