import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useShopping } from '../../store/hooks/useShopping';

export const PurchaseHistoryScreen = ({ navigation }: any) => {
  const { purchaseHistory: history, loading, error, fetchHistory } = useShopping() as any;

  useEffect(() => {
    fetchHistory?.();
  }, []);

  return (
    <Screen title="Historial de compras" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchHistory?.()} />}

      {!history?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>Sin historial todavía.</Text>
        </View>
      ) : (
        <List.Section>
          {(history ?? []).map((h: any) => (
            <List.Item
              key={h.id}
              title={`${h.store ?? 'Compra'} · $${h.totalAmount ?? 0}`}
              description={`${h.purchaseDate ?? ''} · ${h.itemsCount ?? 0} items`}
              left={(p) => <List.Icon {...p} icon="receipt" />}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default PurchaseHistoryScreen;

