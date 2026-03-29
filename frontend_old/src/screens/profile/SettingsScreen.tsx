import React from 'react';
import { View } from 'react-native';
import { List, Switch } from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';

import Screen from '../../components/layout/Screen';
import type { RootState } from '../../app/store';
import { setTheme, setBiometrics, setUnits } from '../../store/slices/userSlice';

export const SettingsScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const settings = useSelector((s: RootState) => s.user.settings);

  return (
    <Screen title="Ajustes" onBack={() => navigation.goBack()}>
      <List.Section>
        <List.Subheader>Tema</List.Subheader>
        <List.Item title="Claro" onPress={() => dispatch(setTheme('light'))} right={() => (settings.theme === 'light' ? <List.Icon icon="check" /> : null)} />
        <List.Item title="Oscuro" onPress={() => dispatch(setTheme('dark'))} right={() => (settings.theme === 'dark' ? <List.Icon icon="check" /> : null)} />
        <List.Item title="Sistema" onPress={() => dispatch(setTheme('system'))} right={() => (settings.theme === 'system' ? <List.Icon icon="check" /> : null)} />
      </List.Section>

      <List.Section>
        <List.Subheader>Biometría</List.Subheader>
        <List.Item
          title="Login con biometría"
          right={() => (
            <Switch value={settings.biometricsEnabled} onValueChange={(v) => dispatch(setBiometrics(v))} />
          )}
        />
      </List.Section>

      <List.Section>
        <List.Subheader>Unidades</List.Subheader>
        <List.Item title="Peso: kg" onPress={() => dispatch(setUnits({ weight: 'kg' }))} right={() => (settings.units.weight === 'kg' ? <List.Icon icon="check" /> : null)} />
        <List.Item title="Peso: lb" onPress={() => dispatch(setUnits({ weight: 'lb' }))} right={() => (settings.units.weight === 'lb' ? <List.Icon icon="check" /> : null)} />
        <List.Item title="Volumen: ml" onPress={() => dispatch(setUnits({ volume: 'ml' }))} right={() => (settings.units.volume === 'ml' ? <List.Icon icon="check" /> : null)} />
        <List.Item title="Volumen: oz" onPress={() => dispatch(setUnits({ volume: 'oz' }))} right={() => (settings.units.volume === 'oz' ? <List.Icon icon="check" /> : null)} />
      </List.Section>
    </Screen>
  );
};

export default SettingsScreen;

