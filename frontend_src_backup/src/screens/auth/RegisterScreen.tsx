import React from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, TouchableOpacity } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, RegisterFormData } from '../../utils/validators';
import { authService } from '../../services/authService';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import SafeArea from '../../components/layout/SafeArea';
import Header from '../../components/layout/Header';

const RegisterScreen = ({ navigation }: any) => {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [accepted, setAccepted] = React.useState(false);

  const { control, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: RegisterFormData) => {
    if (!accepted) { setError('Debes aceptar los términos'); return; }
    setLoading(true);
    setError(null);
    try {
      await authService.register({ name: data.name, email: data.email, password: data.password });
      navigation.navigate('Login');
    } catch (e: any) {
      setError(e.message ?? 'Error de registro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeArea>
      <Header title="Crear Cuenta" onBack={() => navigation.goBack()} />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.flex}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.formCard}>
            {error && (
              <View style={styles.errorBanner}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Controller control={control} name="name"
              render={({ field: { onChange, value } }) => (
                <Input label="Nombre completo" value={value} onChangeText={onChange} placeholder="Juan Pérez" icon="account-outline" error={errors.name?.message} />
              )}
            />
            <Controller control={control} name="email"
              render={({ field: { onChange, value } }) => (
                <Input label="Email" value={value} onChangeText={onChange} placeholder="tu@email.com" icon="email-outline" keyboardType="email-address" autoCapitalize="none" error={errors.email?.message} />
              )}
            />
            <Controller control={control} name="password"
              render={({ field: { onChange, value } }) => (
                <Input label="Contraseña" value={value} onChangeText={onChange} placeholder="Mínimo 8 caracteres" icon="lock-outline" secureTextEntry error={errors.password?.message} />
              )}
            />
            <Controller control={control} name="confirmPassword"
              render={({ field: { onChange, value } }) => (
                <Input label="Confirmar contraseña" value={value} onChangeText={onChange} placeholder="Repite la contraseña" icon="lock-check-outline" secureTextEntry error={errors.confirmPassword?.message} />
              )}
            />

            <TouchableOpacity style={styles.checkboxRow} onPress={() => setAccepted(!accepted)}>
              <View style={[styles.checkbox, accepted && styles.checkboxChecked]}>
                {accepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>Acepto los <Text style={styles.link}>Términos y Condiciones</Text></Text>
            </TouchableOpacity>

            <Button title="Crear Cuenta" onPress={handleSubmit(onSubmit)} loading={loading} fullWidth icon="account-plus" size="large" />
          </View>

          <View style={styles.loginRow}>
            <Text style={styles.loginLabel}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia Sesión</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, padding: SPACING.lg },
  formCard: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, ...SHADOWS.md },
  errorBanner: { backgroundColor: COLORS.danger + '10', padding: SPACING.sm, borderRadius: BORDER_RADIUS.sm, marginBottom: SPACING.md },
  errorText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.danger },
  checkboxRow: { flexDirection: 'row', alignItems: 'center', marginVertical: SPACING.md },
  checkbox: { width: 22, height: 22, borderRadius: 4, borderWidth: 2, borderColor: COLORS.lightGray, marginRight: SPACING.sm, alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  checkmark: { color: COLORS.white, fontSize: 14, fontWeight: 'bold' },
  termsText: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.gray, flex: 1 },
  link: { color: COLORS.primary, fontFamily: FONTS.medium },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: SPACING.lg },
  loginLabel: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.md, color: COLORS.gray },
  loginLink: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.md, color: COLORS.primary },
});

export default RegisterScreen;
