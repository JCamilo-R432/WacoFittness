import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useRest } from '../../store/hooks/useRest';

export const RelaxationScreen = ({ navigation }: any) => {
  const { techniques, loading, error, fetchTechniques } = useRest() as any;

  useEffect(() => {
    fetchTechniques?.();
  }, []);

  return (
    <Screen title="Relajación" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchTechniques?.()} />}

      {!techniques?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay técnicas disponibles.</Text>
        </View>
      ) : (
        <List.Section>
          {(techniques ?? []).map((t: any) => (
            <List.Item
              key={t.id}
              title={t.name}
              description={`${t.durationMinutes ?? 0} min · ${t.category ?? ''}`}
              left={(p) => <List.Icon {...p} icon="meditation" />}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default RelaxationScreen;

