import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import SafeArea from '../../components/layout/SafeArea';
import Header from '../../components/layout/Header';
import Container from '../../components/layout/Container';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { profileSetupSchema, type ProfileSetupFormData } from '../../utils/validators';
import { COLORS, SPACING } from '../../utils/constants';

export const ProfileSetupScreen = ({ navigation }: any) => {
  const { control, handleSubmit, formState: { errors } } = useForm<ProfileSetupFormData>({
    resolver: zodResolver(profileSetupSchema),
    defaultValues: { name: '', age: 25, gender: 'male', weightKg: 70, heightCm: 170 },
  });

  const onSubmit = (_data: ProfileSetupFormData) => {
    navigation.navigate('GoalsSetup');
  };

  return (
    <SafeArea>
      <Header title="Tu perfil" onBack={() => navigation.goBack()} />
      <Container>
        <Text style={styles.helper}>
          Completa tu información básica para personalizar tu experiencia.
        </Text>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, value } }) => (
            <Input label="Nombre" value={value} onChangeText={onChange} error={errors.name?.message} />
          )}
        />
        <Controller
          control={control}
          name="age"
          render={({ field: { onChange, value } }) => (
            <Input
              label="Edad"
              value={String(value ?? '')}
              onChangeText={(t) => onChange(Number(t))}
              keyboardType="numeric"
              error={errors.age?.message as any}
            />
          )}
        />
        <View style={styles.row}>
          <View style={styles.col}>
            <Controller
              control={control}
              name="weightKg"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Peso (kg)"
                  value={String(value ?? '')}
                  onChangeText={(t) => onChange(Number(t))}
                  keyboardType="numeric"
                  error={errors.weightKg?.message as any}
                />
              )}
            />
          </View>
          <View style={styles.col}>
            <Controller
              control={control}
              name="heightCm"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Altura (cm)"
                  value={String(value ?? '')}
                  onChangeText={(t) => onChange(Number(t))}
                  keyboardType="numeric"
                  error={errors.heightCm?.message as any}
                />
              )}
            />
          </View>
        </View>

        <Button title="Continuar" onPress={handleSubmit(onSubmit)} fullWidth icon="arrow-right" />
      </Container>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  helper: { color: COLORS.gray, marginBottom: SPACING.md },
  row: { flexDirection: 'row', gap: SPACING.md },
  col: { flex: 1 },
});

export default ProfileSetupScreen;

