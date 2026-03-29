import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import type { MealLog } from '../../types/models.types';

interface MealCardProps {
  mealType: string;
  mealLabel: string;
  icon: string;
  color: string;
  logs: MealLog[];
  totalCalories: number;
  onPress?: () => void;
  onAddPress?: () => void;
}

const MealCard: React.FC<MealCardProps> = ({
  mealLabel, icon, color, logs, totalCalories, onPress, onAddPress,
}) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
          <Icon name={icon} size={20} color={color} />
        </View>
        <Text style={styles.mealType}>{mealLabel}</Text>
        <Text style={styles.totalCal}>{totalCalories} kcal</Text>
        {onAddPress && (
          <TouchableOpacity onPress={onAddPress} style={[styles.addBtn, { backgroundColor: color }]}>
            <Icon name="plus" size={16} color={COLORS.white} />
          </TouchableOpacity>
        )}
      </View>

      {logs.length > 0 ? (
        logs.map((log) => (
          <View key={log.id} style={styles.logRow}>
            <Text style={styles.logName} numberOfLines={1}>{log.foodItem?.name ?? 'Alimento'}</Text>
            <Text style={styles.logQty}>{Number(log.quantityG).toFixed(0)}g</Text>
            <Text style={styles.logCal}>{log.calories ?? 0} kcal</Text>
          </View>
        ))
      ) : (
        <Text style={styles.empty}>Sin registros</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white, borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md, marginBottom: SPACING.sm, ...SHADOWS.sm,
  },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  iconWrap: {
    width: 32, height: 32, borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm,
  },
  mealType: { fontFamily: FONTS.semiBold, fontSize: FONT_SIZES.md, color: COLORS.dark, flex: 1 },
  totalCal: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.gray, marginRight: SPACING.sm },
  addBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  logRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: SPACING.xs, borderBottomWidth: 0.5, borderBottomColor: COLORS.lighterGray,
  },
  logName: { flex: 1, fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.dark },
  logQty: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray, marginRight: SPACING.sm },
  logCal: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.primary, minWidth: 60, textAlign: 'right' },
  empty: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.mediumGray, fontStyle: 'italic' },
});

export default React.memo(MealCard);
