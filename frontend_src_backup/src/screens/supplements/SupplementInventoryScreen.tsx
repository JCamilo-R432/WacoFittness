import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text, Chip } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useSupplements } from '../../store/hooks/useSupplements';

export const SupplementInventoryScreen = ({ navigation }: any) => {
  const { inventory, loading, error, fetchInventory } = useSupplements() as any;

  useEffect(() => {
    fetchInventory?.();
  }, []);

  return (
    <Screen title="Inventario" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchInventory?.()} />}

      {!inventory?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay suplementos en inventario.</Text>
        </View>
      ) : (
        <List.Section>
          {(inventory ?? []).map((s: any) => (
            <List.Item
              key={s.id}
              title={s.supplement?.name ?? s.name ?? 'Suplemento'}
              description={`Restante: ${s.quantity ?? 0} ${s.unit ?? ''} · Vence: ${s.expirationDate ?? '—'}`}
              left={(p) => <List.Icon {...p} icon="pill" />}
              right={() => (s.isLowStock ? <Chip compact>Stock bajo</Chip> : null)}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default SupplementInventoryScreen;

