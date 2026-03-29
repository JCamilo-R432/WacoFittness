import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import Button from '../../components/ui/Button';
import { useSupplements } from '../../store/hooks/useSupplements';

export const SupplementLogScreen = ({ navigation }: any) => {
  const { logs, loading, error, fetchLogs, quickLog } = useSupplements() as any;

  useEffect(() => {
    fetchLogs?.();
  }, []);

  return (
    <Screen title="Registro" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchLogs?.()} />}

      <Button title="Registrar toma (demo)" onPress={() => quickLog?.()} fullWidth icon="plus" />

      {!logs?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay tomas registradas.</Text>
        </View>
      ) : (
        <List.Section>
          {(logs ?? []).map((l: any) => (
            <List.Item
              key={l.id}
              title={l.supplement?.name ?? 'Suplemento'}
              description={`${l.quantity ?? 0} · ${l.takenAt ?? ''}`}
              left={(p) => <List.Icon {...p} icon="pill" />}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default SupplementLogScreen;

