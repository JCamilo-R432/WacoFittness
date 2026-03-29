import React, { useMemo, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import SafeArea from '../../components/layout/SafeArea';
import Container from '../../components/layout/Container';
import Button from '../../components/ui/Button';
import { COLORS, SPACING } from '../../utils/constants';

const { width } = Dimensions.get('window');

type Slide = { key: string; title: string; body: string; icon: string };

export const WelcomeScreen = ({ navigation }: any) => {
  const slides = useMemo<Slide[]>(
    () => [
      {
        key: 's1',
        title: 'Nutrición inteligente',
        body: 'Registra comidas, macros y recetas. Planifica tu semana y genera lista de compras.',
        icon: 'food-apple',
      },
      {
        key: 's2',
        title: 'Entrena con foco',
        body: 'Rutinas, registro de series, PRs y progreso semanal para fuerza y volumen.',
        icon: 'dumbbell',
      },
      {
        key: 's3',
        title: 'Recuperación y hábitos',
        body: 'Sueño, hidratación, suplementos y notificaciones para mantener la consistencia.',
        icon: 'sleep',
      },
    ],
    [],
  );

  const ref = useRef<FlatList<Slide>>(null);
  const [index, setIndex] = useState(0);

  const goNext = () => {
    const next = Math.min(index + 1, slides.length - 1);
    ref.current?.scrollToIndex({ index: next, animated: true });
    setIndex(next);
  };

  return (
    <SafeArea>
      <Container scroll={false} style={styles.root} padding={false}>
        <FlatList
          ref={ref}
          data={slides}
          keyExtractor={(s) => s.key}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(e) => {
            const i = Math.round(e.nativeEvent.contentOffset.x / width);
            setIndex(i);
          }}
          renderItem={({ item }) => (
            <View style={[styles.slide, { width }]}>
              <View style={styles.iconCircle}>
                <Icon name={item.icon} size={52} color={COLORS.white} />
              </View>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.body}>{item.body}</Text>
            </View>
          )}
        />

        <View style={styles.footer}>
          <View style={styles.dots}>
            {slides.map((s, i) => (
              <View
                key={s.key}
                style={[styles.dot, i === index && styles.dotActive]}
                accessibilityLabel={`Slide ${i + 1}`}
              />
            ))}
          </View>

          <View style={styles.actions}>
            <Button title="Saltar" variant="ghost" onPress={() => navigation.replace('Auth')} />
            <Button
              title={index === slides.length - 1 ? 'Comenzar' : 'Siguiente'}
              onPress={() => (index === slides.length - 1 ? navigation.replace('Auth') : goNext())}
              icon="arrow-right"
              iconPosition="right"
            />
          </View>
        </View>
      </Container>
    </SafeArea>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  slide: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  iconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 24, fontWeight: '800', color: COLORS.dark, textAlign: 'center' },
  body: { fontSize: 14, color: COLORS.gray, textAlign: 'center' },
  footer: { padding: SPACING.lg, gap: SPACING.md },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.lightGray },
  dotActive: { width: 20, backgroundColor: COLORS.primary },
  actions: { flexDirection: 'row', justifyContent: 'space-between', gap: SPACING.md },
});

