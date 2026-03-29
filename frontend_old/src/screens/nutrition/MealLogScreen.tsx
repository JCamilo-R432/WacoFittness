import React, { useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { MEAL_TYPES, SPACING, COLORS } from '../../utils/constants';
import { useNutrition } from '../../store/hooks/useNutrition';

export const MealLogScreen = ({ navigation, route }: any) => {
  const selectedFood = route.params?.selectedFood;
  const initialMealType = route.params?.mealType ?? 'lunch';

  const { dailyLogs, loading, error, logMeal, deleteMealLog } = useNutrition() as any;

  const [mealType, setMealType] = useState<string>(initialMealType);
  const [quantityG, setQuantityG] = useState('100');

  const nutritionPreview = useMemo(() => {
    if (!selectedFood) return null;
    const q = Number(quantityG || 0) / 100;
    const calories = (selectedFood.caloriesPer100g ?? 0) * q;
    const p = (selectedFood.proteinPer100g ?? 0) * q;
    const c = (selectedFood.carbsPer100g ?? 0) * q;
    const f = (selectedFood.fatPer100g ?? 0) * q;
    return { calories, p, c, f };
  }, [selectedFood, quantityG]);

  const onSave = async () => {
    if (!selectedFood) {
      navigation.navigate('FoodSearch', { mealType });
      return;
    }
    await logMeal?.({
      foodItemId: selectedFood.id,
      quantityG: Number(quantityG || 0),
      mealType,
      consumedAt: new Date().toISOString(),
    });
  };

  return (
    <Screen title="Registrar comida" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => {}} />}

      <Text style={styles.label}>Tipo de comida</Text>
      <SegmentedButtons
        value={mealType}
        onValueChange={setMealType}
        buttons={MEAL_TYPES.slice(0, 4).map((m) => ({ value: m.id, label: m.label }))}
      />

      <View style={{ height: SPACING.md }} />

      <Button
        title={selectedFood ? `Alimento: ${selectedFood.name}` : 'Buscar alimento'}
        onPress={() => navigation.navigate('FoodSearch', { mealType })}
        variant="outline"
        fullWidth
        icon="magnify"
      />

      <View style={{ height: SPACING.md }} />

      <Input
        label="Cantidad (g)"
        value={quantityG}
        onChangeText={setQuantityG}
        keyboardType="numeric"
        icon="scale"
      />

      {nutritionPreview && (
        <View style={styles.preview}>
          <Text style={styles.previewTitle}>Info nutricional (estimada)</Text>
          <Text style={styles.previewText}>
            {Math.round(nutritionPreview.calories)} kcal · P {nutritionPreview.p.toFixed(1)}g · C {nutritionPreview.c.toFixed(1)}g · G {nutritionPreview.f.toFixed(1)}g
          </Text>
        </View>
      )}

      <Button title="Guardar" onPress={onSave} fullWidth icon="content-save" />

      <View style={{ height: SPACING.lg }} />
      <Text style={styles.label}>Historial de hoy</Text>
      {(dailyLogs ?? []).slice().reverse().slice(0, 10).map((l: any) => (
        <View key={l.id} style={styles.logRow}>
          <Text style={{ flex: 1, fontWeight: '700' }}>{l.foodItem?.name ?? 'Comida'}</Text>
          <Text style={{ color: COLORS.gray, marginRight: 8 }}>{Math.round(l.calories ?? 0)} kcal</Text>
          <Button title="Eliminar" variant="ghost" onPress={() => deleteMealLog?.(l.id)} />
        </View>
      ))}
    </Screen>
  );
};

const styles = StyleSheet.create({
  label: { fontWeight: '800', color: COLORS.dark, marginBottom: SPACING.sm },
  preview: { backgroundColor: COLORS.white, padding: SPACING.md, borderRadius: 12, marginBottom: SPACING.md },
  previewTitle: { fontWeight: '800', marginBottom: 4 },
  previewText: { color: COLORS.gray },
  logRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
});

export default MealLogScreen;

