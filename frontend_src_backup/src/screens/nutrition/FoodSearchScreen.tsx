import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useNutrition } from '../../store/hooks/useNutrition';
import { useDebounce } from '../../hooks/useDebounce';

export const FoodSearchScreen = ({ navigation, route }: any) => {
  const mealType = route.params?.mealType;
  const { searchResults, loading, error, searchFoods } = useNutrition() as any;
  const [q, setQ] = useState('');
  const qDebounced = useDebounce(q, 300);

  useEffect(() => {
    if (qDebounced?.trim()) searchFoods?.(qDebounced.trim());
  }, [qDebounced]);

  return (
    <Screen title="Buscar alimentos" onBack={() => navigation.goBack()}>
      <Input label="Buscar" value={q} onChangeText={setQ} placeholder="pollo, arroz, banana..." icon="magnify" />
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => searchFoods?.(qDebounced)} />}

      {!qDebounced?.trim() ? (
        <View style={{ padding: 16 }}>
          <Text>Escribe para buscar alimentos.</Text>
        </View>
      ) : (
        <List.Section>
          {searchResults?.map((f: any) => (
            <List.Item
              key={f.id}
              title={f.name}
              description={`${Math.round(f.caloriesPer100g)} kcal /100g · P ${f.proteinPer100g} · C ${f.carbsPer100g} · G ${f.fatPer100g}`}
              left={(p) => <List.Icon {...p} icon="food-apple" />}
              onPress={() =>
                navigation.navigate('MealLog', {
                  date: route.params?.date,
                  selectedFood: f,
                  mealType,
                })
              }
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default FoodSearchScreen;

