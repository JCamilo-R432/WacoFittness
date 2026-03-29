import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Card, List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import Button from '../../components/ui/Button';
import { useShopping } from '../../store/hooks/useShopping';
import { COLORS } from '../../utils/constants';

export const ShoppingDashboard = ({ navigation }: any) => {
  const { lists, pantryItems: pantry, loading, error, fetchLists, fetchPantry } = useShopping() as any;

  useEffect(() => {
    fetchLists?.();
    fetchPantry?.();
  }, []);

  return (
    <Screen title="Compras" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => { fetchLists?.(); fetchPantry?.(); }} />}

      <Card style={{ backgroundColor: COLORS.white, marginBottom: 12 }}>
        <Card.Title title="Listas activas" subtitle={`Total: ${lists?.length ?? 0}`} />
        <Card.Content>
          <Button title="Ver listas" onPress={() => navigation.navigate('ShoppingList')} fullWidth icon="cart" />
        </Card.Content>
      </Card>

      <View style={{ gap: 8 }}>
        <Button title="Despensa" onPress={() => navigation.navigate('Pantry')} variant="outline" fullWidth icon="fridge" />
        <Button title="Historial" onPress={() => navigation.navigate('PurchaseHistory')} variant="outline" fullWidth icon="history" />
      </View>

      <List.Section>
        <List.Subheader>Próximos a vencer</List.Subheader>
        {(pantry ?? []).filter((p: any) => p.isExpired || p.isLowStock).slice(0, 6).map((p: any) => (
          <List.Item
            key={p.id}
            title={p.name}
            description={`Cantidad: ${p.quantity ?? 0} ${p.unit ?? ''} · Vence: ${p.expirationDate ?? '—'}`}
            left={(props) => <List.Icon {...props} icon="alert" />}
          />
        ))}
        {!pantry?.length && <Text style={{ paddingHorizontal: 16 }}>No hay items en despensa.</Text>}
      </List.Section>
    </Screen>
  );
};

export default ShoppingDashboard;

