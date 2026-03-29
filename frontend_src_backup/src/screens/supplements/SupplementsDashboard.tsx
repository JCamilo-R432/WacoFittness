import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Card, Text, List } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import Button from '../../components/ui/Button';
import { useSupplements } from '../../store/hooks/useSupplements';
import { COLORS } from '../../utils/constants';

export const SupplementsDashboard = ({ navigation }: any) => {
  const { todayLogs, inventory, loading, error, fetchToday, fetchInventory } = useSupplements() as any;

  useEffect(() => {
    fetchToday?.();
    fetchInventory?.();
  }, []);

  return (
    <Screen title="Suplementos" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => { fetchToday?.(); fetchInventory?.(); }} />}

      <Card style={{ backgroundColor: COLORS.white, marginBottom: 12 }}>
        <Card.Title title="Hoy" subtitle="Recordatorios y tomas" />
        <Card.Content>
          <Text>Tomas registradas: {todayLogs?.length ?? 0}</Text>
        </Card.Content>
      </Card>

      <View style={{ gap: 8 }}>
        <Button title="Inventario" onPress={() => navigation.navigate('SupplementInventory')} fullWidth icon="warehouse" />
        <Button title="Registro" onPress={() => navigation.navigate('SupplementLog')} variant="outline" fullWidth icon="clipboard-text" />
        <Button title="Stacks" onPress={() => navigation.navigate('Stack')} variant="outline" fullWidth icon="layers" />
      </View>

      <List.Section>
        <List.Subheader>Stock bajo</List.Subheader>
        {(inventory ?? []).filter((i: any) => i.isLowStock).slice(0, 6).map((i: any) => (
          <List.Item
            key={i.id}
            title={i.supplement?.name ?? i.name ?? 'Suplemento'}
            description={`Restante: ${i.quantity ?? 0} ${i.unit ?? ''}`}
            left={(p) => <List.Icon {...p} icon="pill" />}
          />
        ))}
      </List.Section>
    </Screen>
  );
};

export default SupplementsDashboard;

