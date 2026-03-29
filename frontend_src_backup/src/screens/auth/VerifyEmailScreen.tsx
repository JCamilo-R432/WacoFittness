import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import Button from '../../components/ui/Button';
import SafeArea from '../../components/layout/SafeArea';
import Header from '../../components/layout/Header';

const VerifyEmailScreen = ({ navigation, route }: any) => {
  const email = route.params?.email ?? '';
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const refs = Array.from({ length: 6 }, () => React.createRef<TextInput>());

  const handleChange = (text: string, index: number) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);
    if (text && index < 5) refs[index + 1].current?.focus();
  };

  const handleVerify = async () => {
    setLoading(true);
    // await authService.verifyEmail({ email, code: code.join('') });
    setLoading(false);
    navigation.navigate('Login');
  };

  return (
    <SafeArea>
      <Header title="Verificar Email" onBack={() => navigation.goBack()} />
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Icon name="email-outline" size={48} color={COLORS.primary} />
          </View>
          <Text style={styles.title}>Verifica tu email</Text>
          <Text style={styles.desc}>Ingresa el código de 6 dígitos enviado a {email}</Text>

          <View style={styles.codeRow}>
            {code.map((digit, i) => (
              <TextInput
                key={i}
                ref={refs[i]}
                style={[styles.codeInput, digit ? styles.codeInputFilled : null]}
                value={digit}
                onChangeText={(t) => handleChange(t, i)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <Button title="Verificar" onPress={handleVerify} loading={loading} fullWidth size="large" />

          <Button title="Reenviar Código" onPress={() => {}} variant="ghost" fullWidth style={{ marginTop: SPACING.md }} />
        </View>
      </ScrollView>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, justifyContent: 'center', padding: SPACING.lg },
  card: { backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.xl, padding: SPACING.lg, alignItems: 'center', ...SHADOWS.md },
  iconCircle: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: COLORS.primaryBg, alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md,
  },
  title: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xl, color: COLORS.dark, marginBottom: SPACING.sm },
  desc: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.md, color: COLORS.gray, textAlign: 'center', marginBottom: SPACING.lg },
  codeRow: { flexDirection: 'row', justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.lg },
  codeInput: {
    width: 48, height: 56, borderRadius: BORDER_RADIUS.md,
    borderWidth: 2, borderColor: COLORS.lightGray,
    fontFamily: FONTS.bold, fontSize: FONT_SIZES.xxl, color: COLORS.dark, textAlign: 'center',
  },
  codeInputFilled: { borderColor: COLORS.primary, backgroundColor: COLORS.primaryBg },
});

export default VerifyEmailScreen;
