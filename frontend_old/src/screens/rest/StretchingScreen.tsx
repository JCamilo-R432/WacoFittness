import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useRest } from '../../store/hooks/useRest';

export const StretchingScreen = ({ navigation }: any) => {
  const { routines, loading, error, fetchRoutines } = useRest() as any;

  useEffect(() => {
    fetchRoutines?.();
  }, []);

  return (
    <Screen title="Estiramientos" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchRoutines?.()} />}

      {!routines?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay rutinas disponibles.</Text>
        </View>
      ) : (
        <List.Section>
          {(routines ?? []).map((r: any) => (
            <List.Item
              key={r.id}
              title={r.name}
              description={`${r.durationMinutes ?? 0} min · ${r.category ?? ''}`}
              left={(p) => <List.Icon {...p} icon="yoga" />}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default StretchingScreen;

