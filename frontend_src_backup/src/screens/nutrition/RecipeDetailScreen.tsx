import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Card, Chip, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import Button from '../../components/ui/Button';
import { nutritionService } from '../../services/nutritionService';
import { COLORS } from '../../utils/constants';

export const RecipeDetailScreen = ({ navigation, route }: any) => {
  const recipeId = route.params?.recipeId as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recipe, setRecipe] = useState<any>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await nutritionService.getRecipeById(recipeId);
        setRecipe(res.data);
      } catch (e: any) {
        setError(e.message ?? 'Error');
      } finally {
        setLoading(false);
      }
    })();
  }, [recipeId]);

  return (
    <Screen title="Detalle receta" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => navigation.replace('RecipeDetail', { recipeId })} />}

      {recipe && (
        <>
          <Card style={{ marginBottom: 12, backgroundColor: COLORS.white }}>
            <Card.Title title={recipe.name} subtitle={recipe.description} />
            <Card.Content>
              <Text style={{ color: COLORS.gray }}>
                {recipe.servings ?? 1} porciones · Prep {recipe.prepTimeMinutes ?? 0}m · Cook {recipe.cookTimeMinutes ?? 0}m
              </Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                <Chip icon="fire">{Math.round(recipe.caloriesPerServing ?? 0)} kcal</Chip>
                <Chip>P {Math.round(recipe.proteinPerServing ?? 0)}g</Chip>
                <Chip>C {Math.round(recipe.carbsPerServing ?? 0)}g</Chip>
                <Chip>G {Math.round(recipe.fatPerServing ?? 0)}g</Chip>
              </View>
            </Card.Content>
          </Card>

          <Card style={{ marginBottom: 12, backgroundColor: COLORS.white }}>
            <Card.Title title="Ingredientes" />
            <Card.Content>
              {(recipe.ingredients ?? []).slice(0, 20).map((ing: any) => (
                <Text key={ing.id} style={{ marginBottom: 6 }}>
                  - {ing.foodItem?.name ?? 'Ingrediente'} · {ing.quantity} {ing.unit}
                </Text>
              ))}
            </Card.Content>
          </Card>

          <Card style={{ backgroundColor: COLORS.white }}>
            <Card.Title title="Instrucciones" />
            <Card.Content>
              {(recipe.instructions ?? []).slice(0, 20).map((st: any) => (
                <Text key={st.id} style={{ marginBottom: 8 }}>
                  {st.stepNumber}. {st.instruction}
                </Text>
              ))}
            </Card.Content>
          </Card>

          <View style={{ height: 16 }} />
          <Button title="Agregar a plan (demo)" onPress={() => {}} fullWidth icon="plus" />
        </>
      )}
    </Screen>
  );
};

export default RecipeDetailScreen;

