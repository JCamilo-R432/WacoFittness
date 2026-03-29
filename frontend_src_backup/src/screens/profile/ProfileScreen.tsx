import React, { useEffect } from 'react';
import { View } from 'react-native';
import { Card, List, Text } from 'react-native-paper';
import { useSelector } from 'react-redux';

import Screen from '../../components/layout/Screen';
import Button from '../../components/ui/Button';
import { useAuth } from '../../store/hooks/useAuth';
import type { RootState } from '../../app/store';
import { COLORS } from '../../utils/constants';

export const ProfileScreen = ({ navigation }: any) => {
  const { user, logout } = useAuth();
  const settings = useSelector((s: RootState) => s.user.settings);

  useEffect(() => {}, []);

  return (
    <Screen
      title="Perfil"
      rightIcon="cog"
      onRightPress={() => navigation.navigate('Settings')}
    >
      <Card style={{ backgroundColor: COLORS.white, marginBottom: 12 }}>
        <Card.Title title={user?.name ?? 'Usuario'} subtitle={user?.email ?? ''} />
        <Card.Content>
          <Text style={{ color: COLORS.gray }}>
            Tema: {settings.theme} · Unidades: {settings.units.weight}/{settings.units.volume}
          </Text>
        </Card.Content>
      </Card>

      <List.Section>
        <List.Item
          title="Editar perfil"
          left={(p) => <List.Icon {...p} icon="account-edit" />}
          onPress={() => navigation.navigate('EditProfile')}
        />
        <List.Item
          title="Ajustes de notificaciones"
          left={(p) => <List.Icon {...p} icon="bell" />}
          onPress={() => navigation.navigate('NotificationsSettings')}
        />
      </List.Section>

      <View style={{ height: 16 }} />
      <Button title="Cerrar sesión" variant="danger" onPress={() => logout()} fullWidth icon="logout" />
    </Screen>
  );
};

export default ProfileScreen;

