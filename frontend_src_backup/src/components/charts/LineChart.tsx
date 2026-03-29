import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { LineChart as RNLineChart } from 'react-native-chart-kit';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';

const screenWidth = Dimensions.get('window').width;

interface LineChartProps {
  data: { x: string; y: number }[];
  title?: string;
  color?: string;
  height?: number;
  suffix?: string;
}

const LineChart: React.FC<LineChartProps> = ({
  data, title, color = COLORS.primary, height = 220, suffix = '',
}) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin datos suficientes</Text>
      </View>
    );
  }

  const chartData = {
    labels: data.map((d) => d.x),
    datasets: [{ data: data.map((d) => d.y), color: () => color, strokeWidth: 2 }],
  };

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <RNLineChart
        data={chartData}
        width={screenWidth - SPACING.md * 4}
        height={height}
        chartConfig={{
          backgroundColor: COLORS.white,
          backgroundGradientFrom: COLORS.white,
          backgroundGradientTo: COLORS.white,
          decimalCount: 0,
          color: (opacity = 1) => `rgba(108, 99, 255, ${opacity})`,
          labelColor: () => COLORS.gray,
          style: { borderRadius: BORDER_RADIUS.md },
          propsForDots: { r: '4', strokeWidth: '2', stroke: color },
        }}
        bezier
        style={styles.chart}
        yAxisSuffix={suffix}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: FONT_SIZES.base,
    color: COLORS.dark,
    marginBottom: SPACING.sm,
  },
  chart: { borderRadius: BORDER_RADIUS.md, marginLeft: -SPACING.md },
  empty: { padding: SPACING.xl, alignItems: 'center' },
  emptyText: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.mediumGray },
});

export default React.memo(LineChart);
