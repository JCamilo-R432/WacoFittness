import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { formatDuration, formatDate } from '../../utils/formatters';
import type { WorkoutLog } from '../../types/models.types';

interface WorkoutCardProps {
  workout: WorkoutLog;
  onPress?: (workout: WorkoutLog) => void;
}

const WorkoutCard: React.FC<WorkoutCardProps> = ({ workout, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onPress?.(workout)} activeOpacity={0.9}>
      <View style={styles.header}>
        <View style={styles.iconWrap}>
          <Icon name="dumbbell" size={20} color={COLORS.training} />
        </View>
        <View style={styles.headerInfo}>
          <Text style={styles.date}>{formatDate(workout.workoutDate)}</Text>
          {workout.durationMinutes && (
            <Text style={styles.duration}>{formatDuration(workout.durationMinutes)}</Text>
          )}
        </View>
        {workout.isCompleted && (
          <View style={styles.completedBadge}>
            <Icon name="check" size={14} color={COLORS.white} />
          </View>
        )}
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{workout.exercises?.length ?? 0}</Text>
          <Text style={styles.statLabel}>Ejercicios</Text>
        </View>
        {workout.totalVolume && (
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Number(workout.totalVolume).toLocaleString()}</Text>
            <Text style={styles.statLabel}>Vol. (kg)</Text>
          </View>
        )}
        {workout.averageRPE && (
          <View style={styles.stat}>
            <Text style={styles.statValue}>{Number(workout.averageRPE).toFixed(1)}</Text>
            <Text style={styles.statLabel}>RPE prom</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  iconWrap: {
    width: 36, height: 36, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.training + '15',
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm,
  },
  headerInfo: { flex: 1 },
  date: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.md, color: COLORS.dark },
  duration: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray, marginTop: 2 },
  completedBadge: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center',
  },
  stats: { flexDirection: 'row', justifyContent: 'space-around' },
  stat: { alignItems: 'center' },
  statValue: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.lg, color: COLORS.primary },
  statLabel: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray, marginTop: 2 },
});

export default React.memo(WorkoutCard);
