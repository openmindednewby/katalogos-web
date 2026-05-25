import React, { memo, useMemo } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import Svg, { Path, Text as SvgText } from 'react-native-svg';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import { createArcPath, polarToCartesian } from '../utils/pieChartUtils';

import type { DeviceBreakdown } from '../types';

const CHART_SIZE = 180;
const CENTER = 90;
const RADIUS = 80;
const SECTION_TITLE_FONT_SIZE = 16;
const SECTION_MARGIN_BOTTOM = 12;
const EMPTY_TEXT_FONT_SIZE = 14;
const EMPTY_PADDING_VERTICAL = 20;
const LEGEND_FONT_SIZE = 13;
const LEGEND_DOT_SIZE = 12;
const LEGEND_DOT_RADIUS = 6;
const LEGEND_GAP = 8;
const LEGEND_MARGIN_TOP = 12;
const LABEL_FONT_SIZE = 11;
const LABEL_RADIUS_RATIO = 0.6;
const FULL_CIRCLE = 360;
const PERCENTAGE_DIVISOR = 100;
const PIE_LABEL_FILL = '#FFFFFF';

const DEVICE_COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

const styles = StyleSheet.create({
  title: {
    fontSize: SECTION_TITLE_FONT_SIZE,
    fontWeight: '600',
    marginBottom: SECTION_MARGIN_BOTTOM,
  },
  emptyText: {
    fontSize: EMPTY_TEXT_FONT_SIZE,
    textAlign: 'center',
    paddingVertical: EMPTY_PADDING_VERTICAL,
  },
  chartContainer: {
    alignItems: 'center',
  },
  legendContainer: {
    marginTop: LEGEND_MARGIN_TOP,
    gap: LEGEND_GAP,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: LEGEND_GAP,
  },
  legendDot: {
    width: LEGEND_DOT_SIZE,
    height: LEGEND_DOT_SIZE,
    borderRadius: LEGEND_DOT_RADIUS,
  },
  legendText: {
    fontSize: LEGEND_FONT_SIZE,
  },
});

interface DeviceBreakdownChartProps {
  data: DeviceBreakdown[];
}

const DeviceBreakdownChart = memo(({
  data,
}: DeviceBreakdownChartProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  const slices = useMemo(() => {
    if (data.length === 0) return [];

    let currentAngle = 0;

    return data.map((entry, index) => {
      const sliceAngle = (entry.percentage / PERCENTAGE_DIVISOR) * FULL_CIRCLE;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      const midAngle = startAngle + sliceAngle / 2;
      const labelPos = polarToCartesian(CENTER, CENTER, RADIUS * LABEL_RADIUS_RATIO, midAngle);
      currentAngle = endAngle;

      return {
        path: createArcPath(CENTER, RADIUS, startAngle, endAngle),
        color: DEVICE_COLORS[index % DEVICE_COLORS.length],
        label: entry.device,
        percentage: entry.percentage,
        labelPos,
      };
    });
  }, [data]);

  return (
    <View testID={TestIds.MENU_ANALYTICS_DEVICE_CHART}>
      <Text style={[styles.title, { color: colors.text }]}>
        {FM('analytics.detail.deviceBreakdown')}
      </Text>

      {data.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {FM('analytics.detail.noChartData')}
        </Text>
      ) : (
        <View style={styles.chartContainer}>
          <Svg height={CHART_SIZE} width={CHART_SIZE}>
            {slices.map((slice) => (
              <Path
                key={slice.label}
                d={slice.path}
                fill={slice.color}
              />
            ))}
            {slices.map((slice) => {
              const percentText = `${String(Math.round(slice.percentage))}%`;
              return (
                <SvgText
                  key={`label-${slice.label}`}
                  fill={PIE_LABEL_FILL}
                  fontSize={LABEL_FONT_SIZE}
                  fontWeight="600"
                  textAnchor="middle"
                  x={slice.labelPos.x}
                  y={slice.labelPos.y + LABEL_FONT_SIZE / 2}
                >
                  {percentText}
                </SvgText>
              );
            })}
          </Svg>

          <View style={styles.legendContainer}>
            {slices.map((slice) => (
              <View key={slice.label} style={styles.legendItem}>
                <View style={[styles.legendDot, { backgroundColor: slice.color }]} />
                <Text style={[styles.legendText, { color: colors.text }]}>
                  {FM('analytics.detail.deviceLabel', slice.label, String(Math.round(slice.percentage)))}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
});

DeviceBreakdownChart.displayName = 'DeviceBreakdownChart';

export default DeviceBreakdownChart;
