import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { forgotPasswordSchema } from '../../utils/validators';
import { authService } from '../../services/authService';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SafeArea from '../../components/layout/SafeArea';
import Header from '../../components/layout/Header';

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await authService.forgotPassword(data);
      setSent(true);
    } catch {} finally {
      setLoading(false);
    }
  };

  return (
    <SafeArea>
      <Header title="Recuperar Contraseña" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          {sent ? (
            <View style={styles.successContainer}>
              <View style={styles.successIcon}>
                <Icon name="email-check-outline" size={48} color={COLORS.success} />
              </View>
              <Text style={styles.successTitle}>¡Email Enviado!</Text>
              <Text style={styles.successText}>
                Revisa tu bandeja de entrada y sigue las instrucciones para restablecer tu contraseña.
              </Text>
              <Button title="Volver a Login" onPress={() => navigation.navigate('Login')} variant="outline" fullWidth />
            </View>
          ) : (
            <>
              <View style={styles.iconContainer}>
                <Icon name="lock-reset" size={48} color={COLORS.primary} />
              </View>
              <Text style={styles.description}>
                Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
              </Text>
              <Controller control={control} name="email"
                render={({ field: { onChange, value } }) => (
                  <Input label="Email" value={value} onChangeText={onChange} placeholder="tu@email.com" icon="email-outline" keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
                )}
              />
              <Button title="Enviar Enlace" onPress={handleSubmit(onSubmit)} loading={loading} fullWidth size="large" />
            </>
          )}
        </View>
      </ScrollView>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, ...SHADOWS.md },
  iconContainer: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center',
    alignSelf: 'center', marginBottom: SPACING.lg,
  },
  description: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.md, color: COLORS.gray, textAlign: 'center', marginBottom: SPACING.lg },
  successContainer: { alignItems: 'center' },
  successIcon: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.success + '15', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
  },
  successTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.dark, marginBottom: SPACING.sm },
  successText: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.md, color: COLORS.gray, textAlign: 'center', marginBottom: SPACING.lg },
});

export default ForgotPasswordScreen;
