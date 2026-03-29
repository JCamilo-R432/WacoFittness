import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { COLORS, SPACING } from '../../utils/constants';
import { useRest } from '../../store/hooks/useRest';

export const SleepLogScreen = ({ navigation }: any) => {
  const { loading, error, createSleepLog } = useRest() as any;
  const [bedtime, setBedtime] = useState('23:00');
  const [wakeTime, setWakeTime] = useState('07:00');
  const [quality, setQuality] = useState('4');

  const onSave = async () => {
    await createSleepLog?.({
      date: new Date().toISOString().slice(0, 10),
      bedtime,
      wakeTime,
      quality: Number(quality || 0),
    });
    navigation.goBack();
  };

  return (
    <Screen title="Registro de sueño" onBack={() => navigation.goBack()}>
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => {}} />}

      <Text style={styles.helper}>Completa tu sueño de anoche para calcular tu recuperación.</Text>
      <Input label="Hora de dormir (HH:mm)" value={bedtime} onChangeText={setBedtime} icon="clock-outline" />
      <Input label="Hora de despertar (HH:mm)" value={wakeTime} onChangeText={setWakeTime} icon="clock" />
      <Input label="Calidad (1-5)" value={quality} onChangeText={setQuality} keyboardType="numeric" icon="star" />
      <Button title="Guardar" onPress={onSave} fullWidth icon="content-save" />
    </Screen>
  );
};

const styles = StyleSheet.create({
  helper: { color: COLORS.gray, marginBottom: SPACING.md },
});

export default SleepLogScreen;

