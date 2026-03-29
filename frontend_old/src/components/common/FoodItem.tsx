import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS } from '../../utils/constants';
import type { FoodItem as FoodItemType } from '../../types/models.types';

interface FoodItemProps {
  food: FoodItemType;
  onPress?: (food: FoodItemType) => void;
  showMacros?: boolean;
  quantity?: number;
}

const FoodItem: React.FC<FoodItemProps> = ({ food, onPress, showMacros = true, quantity }) => {
  const cals = quantity ? Math.round((food.caloriesPer100g * quantity) / 100) : food.caloriesPer100g;

  return (
    <TouchableOpacity style={styles.container} onPress={() => onPress?.(food)} activeOpacity={0.8}>
      <View style={styles.iconWrap}>
        <Icon name="food-apple" size={24} color={COLORS.nutrition} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={1}>{food.name}</Text>
        {food.brand && <Text style={styles.brand}>{food.brand}</Text>}
        {showMacros && (
          <View style={styles.macros}>
            <Text style={[styles.macroText, { color: COLORS.primary }]}>P: {Number(food.proteinPer100g).toFixed(0)}g</Text>
            <Text style={[styles.macroText, { color: COLORS.warning }]}>C: {Number(food.carbsPer100g).toFixed(0)}g</Text>
            <Text style={[styles.macroText, { color: COLORS.danger }]}>G: {Number(food.fatPer100g).toFixed(0)}g</Text>
          </View>
        )}
      </View>
      <View style={styles.calories}>
        <Text style={styles.calValue}>{cals}</Text>
        <Text style={styles.calUnit}>kcal</Text>
        {quantity && <Text style={styles.perUnit}>/ {quantity}g</Text>}
        {!quantity && <Text style={styles.perUnit}>/ 100g</Text>}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.lighterGray,
  },
  iconWrap: {
    width: 40, height: 40, borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.nutrition + '15',
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.sm,
  },
  info: { flex: 1 },
  name: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.md, color: COLORS.dark },
  brand: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray, marginTop: 2 },
  macros: { flexDirection: 'row', marginTop: 4, gap: SPACING.sm },
  macroText: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs },
  calories: { alignItems: 'flex-end' },
  calValue: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.base, color: COLORS.dark },
  calUnit: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray },
  perUnit: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.mediumGray },
});

export default React.memo(FoodItem);
