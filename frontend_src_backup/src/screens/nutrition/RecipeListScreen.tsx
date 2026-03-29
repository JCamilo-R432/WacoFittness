import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import Input from '../../components/ui/Input';
import { useNutrition } from '../../store/hooks/useNutrition';
import { useDebounce } from '../../hooks/useDebounce';

export const RecipeListScreen = ({ navigation }: any) => {
  const { recipes, loading, error, fetchRecipes } = useNutrition() as any;
  const [q, setQ] = React.useState('');
  const qDebounced = useDebounce(q, 350);

  useEffect(() => {
    fetchRecipes?.(qDebounced ? { search: qDebounced } : undefined);
  }, [qDebounced]);

  return (
    <Screen title="Recetas" onBack={() => navigation.goBack()}>
      <Input label="Buscar receta" value={q} onChangeText={setQ} placeholder="pollo, avena..." icon="magnify" />
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchRecipes?.()} />}

      {!recipes?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay recetas disponibles.</Text>
        </View>
      ) : (
        <List.Section>
          {recipes.map((r: any) => (
            <List.Item
              key={r.id}
              title={r.name}
              description={`${r.servings ?? 1} porciones · ${r.prepTimeMinutes ?? 0} min`}
              left={(p) => <List.Icon {...p} icon="chef-hat" />}
              onPress={() => navigation.navigate('RecipeDetail', { recipeId: r.id })}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default RecipeListScreen;

