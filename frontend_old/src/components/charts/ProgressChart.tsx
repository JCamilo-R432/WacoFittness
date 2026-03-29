import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONTS, FONT_SIZES, SPACING } from '../../utils/constants';

interface ProgressChartProps {
  value: number; // 0-100
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  label?: string;
  unit?: string;
  showPercent?: boolean;
}

const ProgressChart: React.FC<ProgressChartProps> = ({
  value, maxValue = 100, size = 120, strokeWidth = 10,
  color = COLORS.primary, label, unit, showPercent = false,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min(value / maxValue, 1);
  const strokeDashoffset = circumference * (1 - percentage);

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={COLORS.lighterGray} strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90, ${size / 2}, ${size / 2})`}
        />
      </Svg>
      <View style={[styles.labelContainer, { width: size, height: size }]}>
        <Text style={[styles.value, { color }]}>
          {showPercent ? `${Math.round(percentage * 100)}%` : value}
        </Text>
        {unit && <Text style={styles.unit}>{unit}</Text>}
      </View>
      {label && <Text style={styles.label}>{label}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  labelContainer: {
    position: 'absolute', top: 0, alignItems: 'center', justifyContent: 'center',
  },
  value: { fontFamily: FONTS.bold, fontSize: FONT_SIZES.xxl },
  unit: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.xs, color: COLORS.gray },
  label: {
    fontFamily: FONTS.medium, fontSize: FONT_SIZES.sm, color: COLORS.gray, marginTop: SPACING.xs,
  },
});

export default React.memo(ProgressChart);
