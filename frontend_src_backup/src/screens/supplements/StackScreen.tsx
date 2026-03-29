import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useSupplements } from '../../store/hooks/useSupplements';

export const StackScreen = ({ navigation }: any) => {
  const { stacks, loading, error, fetchStacks } = useSupplements() as any;

  useEffect(() => {
    fetchStacks?.();
  }, []);

  return (
    <Screen title="Stacks" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchStacks?.()} />}

      {!stacks?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay stacks disponibles.</Text>
        </View>
      ) : (
        <List.Section>
          {(stacks ?? []).map((s: any) => (
            <List.Item
              key={s.id}
              title={s.name}
              description={`${s.goal ?? ''} · ${s.monthlyCost ? `$${s.monthlyCost}/mes` : ''}`}
              left={(p) => <List.Icon {...p} icon="layers" />}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default StackScreen;

