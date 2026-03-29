import React, { useEffect } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useNotificationsData } from '../../store/hooks/useNotifications';

export const NotificationsScreen = ({ navigation }: any) => {
  const { notifications: items, loading, error, fetchNotifications, markAllRead, markRead, deleteNotification } =
    useNotificationsData();

  useEffect(() => {
    fetchNotifications?.();
  }, []);

  return (
    <Screen title="Notificaciones" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchNotifications?.()} />}

      <List.Section>
        <List.Subheader>Recientes</List.Subheader>
        <List.Item
          title="Marcar todas como leídas"
          left={(p) => <List.Icon {...p} icon="check-all" />}
          onPress={() => markAllRead?.()}
        />
      </List.Section>

      {!items?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No tienes notificaciones todavía.</Text>
        </View>
      ) : (
        <List.Section>
          {items.map((n: any) => (
            <List.Item
              key={n.id}
              title={n.title}
              description={n.body}
              left={(p) => <List.Icon {...p} icon={n.status === 'unread' ? 'bell-badge' : 'bell'} />}
              onPress={() => markRead?.(n.id)}
              onLongPress={() => deleteNotification?.(n.id)}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default NotificationsScreen;

