import React, { useEffect } from 'react';
import { List, Switch } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { NOTIFICATION_CATEGORIES } from '../../utils/constants';
import { useNotificationsData } from '../../store/hooks/useNotifications';

export const NotificationsSettingsScreen = ({ navigation }: any) => {
  const { preferences, loading, error, fetchPreferences, updatePreferences } = useNotificationsData();

  useEffect(() => {
    fetchPreferences?.();
  }, []);

  const cats = preferences?.categories ?? {};

  return (
    <Screen title="Notificaciones" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchPreferences?.()} />}

      <List.Section>
        <List.Subheader>Categorías</List.Subheader>
        {NOTIFICATION_CATEGORIES.map((c) => (
          <List.Item
            key={c.id}
            title={c.label}
            left={(p) => <List.Icon {...p} icon={c.icon} />}
            right={() => (
              <Switch
                value={cats[c.id] ?? true}
                onValueChange={(v) =>
                  updatePreferences?.({
                    ...(preferences ?? {}),
                    categories: { ...cats, [c.id]: v },
                  })
                }
              />
            )}
          />
        ))}
      </List.Section>
    </Screen>
  );
};

export default NotificationsSettingsScreen;

