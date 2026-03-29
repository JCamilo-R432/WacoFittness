import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useHydration } from '../../store/hooks/useHydration';

export const WaterLogScreen = ({ navigation }: any) => {
  const { todayLogs: logs, loading, error, fetchTodayLogs: fetchLogs, deleteLog } = useHydration() as any;

  useEffect(() => {
    fetchLogs?.();
  }, []);

  return (
    <Screen title="Registro de agua" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchLogs?.()} />}

      {!logs?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay registros hoy.</Text>
        </View>
      ) : (
        <List.Section>
          {(logs ?? []).map((l: any) => (
            <List.Item
              key={l.id}
              title={`${l.amountMl ?? 0} ml`}
              description={`${l.liquidType ?? 'water'} · ${l.loggedAt ?? ''}`}
              left={(p) => <List.Icon {...p} icon="water" />}
              onLongPress={() => deleteLog?.(l.id)}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default WaterLogScreen;

