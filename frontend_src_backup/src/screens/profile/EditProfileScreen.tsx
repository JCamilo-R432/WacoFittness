import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { COLORS, SPACING } from '../../utils/constants';

export const EditProfileScreen = ({ navigation }: any) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  return (
    <Screen title="Editar perfil" onBack={() => navigation.goBack()}>
      <Text style={styles.helper}>Actualiza tus datos (demo). Integra aquí tu endpoint `user/profile`.</Text>
      <Input label="Nombre" value={name} onChangeText={setName} icon="account" />
      <Input label="Email" value={email} onChangeText={setEmail} icon="email" keyboardType="email-address" autoCapitalize="none" />
      <Button title="Guardar cambios" onPress={() => navigation.goBack()} fullWidth icon="content-save" />
    </Screen>
  );
};

const styles = StyleSheet.create({
  helper: { color: COLORS.gray, marginBottom: SPACING.md },
});

export default EditProfileScreen;

