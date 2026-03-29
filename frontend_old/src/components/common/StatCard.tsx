import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';

interface StatCardProps {
  title: string;
  value: string | number;
  unit?: string;
  icon: string;
  progress?: number; // 0-100
  color?: string;
  onPress?: () => void;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title, value, unit, icon, progress, color = COLORS.primary,
  onPress, subtitle,
}) => {
  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper style={styles.card} onPress={onPress} activeOpacity={0.9}>
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
          <Icon name={icon} size={22} color={color} />
        </View>
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
      </View>
      <View style={styles.valueRow}>
        <Text style={[styles.value, { color }]}>{value}</Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      {progress !== undefined && (
        <View style={styles.progressBg}>
          <View
            style={[styles.progressFill, { width: `${Math.min(progress, 100)}%`, backgroundColor: color }]}
          />
        </View>
      )}
    </Wrapper>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    flex: 1,
    minWidth: 140,
    ...SHADOWS.sm,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm },
  iconContainer: {
    width: 32, height: 32, borderRadius: BORDER_RADIUS.sm,
    alignItems: 'center', justifyContent: 'center', marginRight: SPACING.xs,
  },
  title: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.xs, color: COLORS.gray, flex: 1 },
  valueRow: { flexDirection: 'row', alignItems: 'baseline' },
  value: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xxl },
  unit: { fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.gray, marginLeft: 4 },
  subtitle: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.mediumGray, marginTop: 2 },
  progressBg: {
    height: 4, backgroundColor: COLORS.lighterGray,
    borderRadius: 2, marginTop: SPACING.sm, overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 2 },
});

export default React.memo(StatCard);
