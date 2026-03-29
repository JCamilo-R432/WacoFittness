import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Text, RadioButton } from 'react-native-paper';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useDispatch } from 'react-redux';

import SafeArea from '../../components/layout/SafeArea';
import Header from '../../components/layout/Header';
import Container from '../../components/layout/Container';
import Button from '../../components/ui/Button';
import { goalsSetupSchema, type GoalsSetupFormData } from '../../utils/validators';
import { setOnboardingCompleted } from '../../store/slices/userSlice';
import { COLORS, GOALS, EXPERIENCE_LEVELS, SPACING } from '../../utils/constants';

export const GoalsSetupScreen = ({ navigation }: any) => {
  const dispatch = useDispatch();
  const { control, handleSubmit, formState: { errors } } = useForm<GoalsSetupFormData>({
    resolver: zodResolver(goalsSetupSchema),
    defaultValues: { goal: 'muscleGain', experienceLevel: 'beginner', trainingDaysPerWeek: 3 },
  });

  const onSubmit = (_data: GoalsSetupFormData) => {
    dispatch(setOnboardingCompleted());
    navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
  };

  return (
    <SafeArea>
      <Header title="Objetivos" onBack={() => navigation.goBack()} />
      <Container>
        <Text style={styles.helper}>Elige tu objetivo principal y tu nivel de experiencia.</Text>

        <Text style={styles.sectionTitle}>Objetivo</Text>
        <Controller
          control={control}
          name="goal"
          render={({ field: { onChange, value } }) => (
            <RadioButton.Group onValueChange={onChange} value={value}>
              {GOALS.map((g) => (
                <View key={g.id} style={styles.radioRow}>
                  <RadioButton value={g.id as any} />
                  <Text style={styles.radioLabel}>{g.label}</Text>
                </View>
              ))}
            </RadioButton.Group>
          )}
        />
        {!!errors.goal?.message && <Text style={styles.error}>{errors.goal.message}</Text>}

        <Text style={styles.sectionTitle}>Experiencia</Text>
        <Controller
          control={control}
          name="experienceLevel"
          render={({ field: { onChange, value } }) => (
            <RadioButton.Group onValueChange={onChange} value={value}>
              {EXPERIENCE_LEVELS.map((lvl) => (
                <View key={lvl.id} style={styles.radioRow}>
                  <RadioButton value={lvl.id as any} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.radioLabel}>{lvl.label}</Text>
                    <Text style={styles.radioHint}>{lvl.description}</Text>
                  </View>
                </View>
              ))}
            </RadioButton.Group>
          )}
        />
        {!!errors.experienceLevel?.message && <Text style={styles.error}>{errors.experienceLevel.message}</Text>}

        <Button title="Finalizar" onPress={handleSubmit(onSubmit)} fullWidth icon="check" />
      </Container>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  helper: { color: COLORS.gray, marginBottom: SPACING.md },
  sectionTitle: { marginTop: SPACING.md, marginBottom: SPACING.sm, fontWeight: '700', color: COLORS.dark },
  radioRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 4 },
  radioLabel: { color: COLORS.dark, fontWeight: '600' },
  radioHint: { color: COLORS.gray, fontSize: 12 },
  error: { color: COLORS.danger, marginTop: 4 },
});

export default GoalsSetupScreen;

