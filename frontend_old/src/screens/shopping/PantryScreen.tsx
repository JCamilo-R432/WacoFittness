import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text, Chip } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useShopping } from '../../store/hooks/useShopping';

export const PantryScreen = ({ navigation }: any) => {
  const { pantryItems: pantry, loading, error, fetchPantry } = useShopping() as any;

  useEffect(() => {
    fetchPantry?.();
  }, []);

  return (
    <Screen title="Despensa" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchPantry?.()} />}

      {!pantry?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay items en despensa.</Text>
        </View>
      ) : (
        <List.Section>
          {(pantry ?? []).map((p: any) => (
            <List.Item
              key={p.id}
              title={p.name}
              description={`${p.quantity ?? 0} ${p.unit ?? ''} · ${p.location ?? ''}`}
              left={(props) => <List.Icon {...props} icon="fridge-outline" />}
              right={() => (p.isLowStock ? <Chip compact>Stock bajo</Chip> : p.isExpired ? <Chip compact>Vencido</Chip> : null)}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default PantryScreen;

