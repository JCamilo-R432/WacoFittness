import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import { PieChart as RNPieChart } from 'react-native-chart-kit';
import { COLORS, FONTS, FONT_SIZES, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';

const screenWidth = Dimensions.get('window').width;

interface PieChartSlice {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: PieChartSlice[];
  title?: string;
  height?: number;
}

const PieChart: React.FC<PieChartProps> = ({ data, title, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin datos</Text>
      </View>
    );
  }

  const chartData = data.map((d) => ({
    name: d.name,
    population: d.value,
    color: d.color,
    legendFontColor: COLORS.gray,
    legendFontSize: 12,
  }));

  return (
    <View style={styles.container}>
      {title && <Text style={styles.title}>{title}</Text>}
      <RNPieChart
        data={chartData}
        width={screenWidth - SPACING.md * 4}
        height={height}
        chartConfig={{
          color: () => COLORS.primary,
        }}
        accessor="population"
        backgroundColor="transparent"
        paddingLeft="15"
        absolute
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
  empty: { padding: SPACING.xl, alignItems: 'center' },
  emptyText: { fontFamily: FONTS.regular, fontSize: FONT_SIZES.sm, color: COLORS.mediumGray },
});

export default React.memo(PieChart);
