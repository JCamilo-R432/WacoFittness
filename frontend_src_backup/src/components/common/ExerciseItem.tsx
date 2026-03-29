import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/constants';
import type { Exercise } from '../../types/models.types';

interface ExerciseItemProps {
  exercise: Exercise;
  onPress?: (exercise: Exercise) => void;
  showMuscles?: boolean;
}

const ExerciseItem: React.FC<ExerciseItemProps> = ({ exercise, onPress, showMuscles = true }) => {
  const difficultyColor = exercise.difficulty === 'beginner' ? COLORS.success :
    exercise.difficulty === 'intermediate' ? COLORS.warning : COLORS.danger;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(exercise)} activeOpacity={0.8}>
      <View style={styles.iconWrap}>
        <Icon name="dumbbell" size={22} color={COLORS.training} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{exercise.name}</Text>
        <View style={styles.tags}>
          <View style={[styles.tag, { backgroundColor: difficultyColor + '15' }]}>
            <Text style={[styles.tagText, { color: difficultyColor }]}>{exercise.difficulty}</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: COLORS.primary + '15' }]}>
            <Text style={[styles.tagText, { color: COLORS.primary }]}>{exercise.type}</Text>
          </View>
        </View>
        {showMuscles && exercise.primaryMuscles?.length > 0 && (
          <Text style={styles.muscles} numberOfLines={1}>
            {exercise.primaryMuscles.join(', ')}
          </Text>
        )}
      </View>
      <Icon name="chevron-right" size={20} color={COLORS.mediumGray} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md,
    borderBottomWidth: 0.5, borderBottomColor: COLORS.lighterGray,
  },
  iconWrap: {
    width: 44, height: 44, borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.training + '15',
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm,
  },
  info: { flex: 1 },
  name: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.md, color: COLORS.dark },
  tags: { flexDirection: 'row', marginTop: 4, gap: SPACING.xs },
  tag: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: BORDER_RADIUS.xs },
  tagText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs },
  muscles: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray, marginTop: 4 },
});

export default React.memo(ExerciseItem);
