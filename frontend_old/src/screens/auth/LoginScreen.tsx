import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useAuth } from '../../store/hooks/useAuth';
import { useBiometrics } from '../../hooks/useBiometrics';
import { loginSchema, LoginFormData } from '../../utils/validators';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SafeArea from '../../components/layout/SafeArea';

const LoginScreen = ({ navigation }: any) => {
  const { login, loading, error } = useAuth();
  const { isAvailable: bioAvailable, authenticate } = useBiometrics();

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch {}
  };

  const handleBiometricLogin = async () => {
    const success = await authenticate('Inicia sesión con biometría');
    if (success) {
      // Biometric success — attempt token-based re-auth
    }
  };

  return (
    <SafeArea style={styles.safe}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Logo */}
          <View style={styles.logoContainer}>
            <View style={styles.logoCircle}>
              <Icon name="dumbbell" size={48} color={COLORS.white} />
            </View>
            <Text style={styles.appName}>MuscleApp</Text>
            <Text style={styles.tagline}>Tu compañero de musculación</Text>
          </View>

          {/* Form */}
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Iniciar Sesión</Text>

            {error && (
              <View style={styles.errorBanner}>
                <Icon name="alert-circle" size={18} color={COLORS.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  placeholder="tu@email.com"
                  icon="email-outline"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <Input
                  label="Contraseña"
                  value={value}
                  onChangeText={onChange}
                  placeholder="••••••••"
                  icon="lock-outline"
                  secureTextEntry
                  error={errors.password?.message}
                />
              )}
            />

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.forgotLink}>
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            <Button
              title="Iniciar Sesión"
              onPress={handleSubmit(onSubmit)}
              loading={loading}
              fullWidth
              icon="login"
              size="large"
            />

            {bioAvailable && (
              <TouchableOpacity style={styles.bioButton} onPress={handleBiometricLogin}>
                <Icon name="fingerprint" size={32} color={COLORS.primary} />
                <Text style={styles.bioText}>Usar biometría</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Register link */}
          <View style={styles.registerRow}>
            <Text style={styles.registerLabel}>¿No tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.registerLink}>Regístrate</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  safe: { backgroundColor: COLORS.background },
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  logoContainer: { alignItems: 'center', marginBottom: SPACING.xl },
  logoCircle: {
    width: 90, height: 90, borderRadius: 45,
    backgroundColor: COLORS.primary,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.lg,
  },
  appName: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xxxl, color: COLORS.dark, marginTop: SPACING.md },
  tagline: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.md, color: COLORS.gray, marginTop: SPACING.xs },
  formCard: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg, ...SHADOWS.md,
  },
  formTitle: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.dark, marginBottom: SPACING.lg, textAlign: 'center' },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.danger + '10', padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.md,
  },
  errorText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.danger, marginLeft: SPACING.xs, flex: 1 },
  forgotLink: { alignSelf: 'flex-end', marginBottom: SPACING.lg },
  forgotText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.primary },
  bioButton: { alignItems: 'center', marginTop: SPACING.lg },
  bioText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.primary, marginTop: SPACING.xs },
  registerRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  registerLabel: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.md, color: COLORS.gray },
  registerLink: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.md, color: COLORS.primary },
});

export default LoginScreen;
