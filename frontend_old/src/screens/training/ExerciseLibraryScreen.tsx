import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { List, Text } from 'react-native-paper';

import Screen from '../../components/layout/Screen';
import Input from '../../components/ui/Input';
import Loading from '../../components/ui/Loading';
import ErrorView from '../../components/ui/Error';
import { useTraining } from '../../store/hooks/useTraining';
import { useDebounce } from '../../hooks/useDebounce';

export const ExerciseLibraryScreen = ({ navigation }: any) => {
  const { exercises, loading, error, fetchExercises } = useTraining() as any;
  const [q, setQ] = useState('');
  const qDebounced = useDebounce(q, 300);

  useEffect(() => {
    fetchExercises?.(qDebounced ? { search: qDebounced } : undefined);
  }, [qDebounced]);

  return (
    <Screen title="Ejercicios" onBack={() => navigation.goBack()}>
      <Input label="Buscar" value={q} onChangeText={setQ} placeholder="press banca..." icon="magnify" />
      {loading && <Loading />}
      {error && <ErrorView message={error} onRetry={() => fetchExercises?.()} />}

      {!exercises?.length && !loading ? (
        <View style={{ padding: 16 }}>
          <Text>No hay ejercicios para mostrar.</Text>
        </View>
      ) : (
        <List.Section>
          {exercises.map((e: any) => (
            <List.Item
              key={e.id}
              title={e.name}
              description={`${e.category ?? ''} · ${e.difficulty ?? ''}`}
              left={(p) => <List.Icon {...p} icon="dumbbell" />}
            />
          ))}
        </List.Section>
      )}
    </Screen>
  );
};

export default ExerciseLibraryScreen;

