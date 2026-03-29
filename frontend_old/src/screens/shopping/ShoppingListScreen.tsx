import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text, Checkbox } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useShopping } from '../../store/hooks/useShopping';

export const ShoppingListScreen = ({ navigation }: any) => {
  const { lists, activeList, loading, error, fetchLists, setActiveList, toggleItem } = useShopping() as any;

  useEffect(() => {
    fetchLists?.();
  }, []);

  const list = activeList ?? lists?.[0];

  useEffect(() => {
    if (!activeList && lists?.length) setActiveList?.(lists[0]);
  }, [lists]);

  return (
    <Screen title="Lista de compras" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchLists?.()} />}

      {!list && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay listas.</Text>
        </View>
      ) : (
        <>
          <List.Section>
            <List.Subheader>{list?.name ?? 'Lista'}</List.Subheader>
            {(list?.items ?? []).map((it: any) => (
              <List.Item
                key={it.id}
                title={it.name}
                description={`${it.quantity ?? 0} ${it.unit ?? ''}`}
                left={() => (
                  <Checkbox
                    status={it.isPurchased ? 'checked' : 'unchecked'}
                    onPress={() => toggleItem?.(list.id, it.id, !it.isPurchased)}
                  />
                )}
              />
            ))}
          </List.Section>
        </>
      )}
    </Screen>
  );
};

export default ShoppingListScreen;

