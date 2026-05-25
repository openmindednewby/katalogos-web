import React, { memo, useMemo } from 'react';

import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import Svg, { Line, Polyline, Circle, Text as SvgText } from 'react-native-svg';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import type { ScansByDayEntry } from '../types';

const CHART_HEIGHT = 200;
const CHART_PADDING_HORIZONTAL = 48;
const CHART_PADDING_TOP = 16;
const CHART_PADDING_BOTTOM = 32;
const CHART_STROKE_WIDTH = 2;
const DOT_RADIUS = 4;
const SECTION_TITLE_FONT_SIZE = 16;
const SECTION_MARGIN_BOTTOM = 12;
const EMPTY_TEXT_FONT_SIZE = 14;
const EMPTY_PADDING_VERTICAL = 20;
const GRID_LINE_COUNT = 4;
const LABEL_FONT_SIZE = 10;

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
});

interface ViewsOverTimeChartProps {
  data: ScansByDayEntry[];
}

const ViewsOverTimeChart = memo(({
  data,
}: ViewsOverTimeChartProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const { width: screenWidth } = useWindowDimensions();
  const chartWidth = screenWidth - CHART_PADDING_HORIZONTAL;

  const { points, maxCount, gridValues } = useMemo(() => {
    if (data.length === 0) return { points: '', maxCount: 0, gridValues: [] };

    const max = Math.max(...data.map((d) => d.count), 1);
    const drawWidth = chartWidth - CHART_PADDING_HORIZONTAL;
    const drawHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

    const pts = data.map((entry, index) => {
      const x = CHART_PADDING_HORIZONTAL + (index / Math.max(data.length - 1, 1)) * drawWidth;
      const y = CHART_PADDING_TOP + drawHeight - (entry.count / max) * drawHeight;
      return { x, y, entry };
    });

    const gridVals = Array.from({ length: GRID_LINE_COUNT }, (_, i) =>
      Math.round((max / GRID_LINE_COUNT) * (GRID_LINE_COUNT - i)),
    );

    return {
      points: pts.map((p) => `${p.x},${p.y}`).join(' '),
      maxCount: max,
      gridValues: gridVals,
    };
  }, [data, chartWidth]);

  const drawHeight = CHART_HEIGHT - CHART_PADDING_TOP - CHART_PADDING_BOTTOM;

  return (
    <View testID={TestIds.MENU_ANALYTICS_VIEWS_CHART}>
      <Text style={[styles.title, { color: colors.text }]}>
        {FM('analytics.detail.viewsOverTime')}
      </Text>

      {data.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {FM('analytics.detail.noChartData')}
        </Text>
      ) : (
        <Svg height={CHART_HEIGHT} width={chartWidth}>
          {gridValues.map((val) => {
            const y = CHART_PADDING_TOP + drawHeight - (val / maxCount) * drawHeight;
            return (
              <React.Fragment key={val}>
                <Line
                  stroke={colors.border}
                  strokeDasharray="4,4"
                  strokeWidth={1}
                  x1={CHART_PADDING_HORIZONTAL}
                  x2={chartWidth - CHART_PADDING_HORIZONTAL}
                  y1={y}
                  y2={y}
                />
                <SvgText
                  fill={colors.textSecondary}
                  fontSize={LABEL_FONT_SIZE}
                  textAnchor="end"
                  x={CHART_PADDING_HORIZONTAL - LABEL_FONT_SIZE}
                  y={y + LABEL_FONT_SIZE / 2}
                >
                  {val}
                </SvgText>
              </React.Fragment>
            );
          })}

          <Polyline
            fill="none"
            points={points}
            stroke={primary}
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={CHART_STROKE_WIDTH}
          />

          {data.map((entry, index) => {
            const drawW = chartWidth - CHART_PADDING_HORIZONTAL;
            const x = CHART_PADDING_HORIZONTAL + (index / Math.max(data.length - 1, 1)) * drawW;
            const y = CHART_PADDING_TOP + drawHeight - (entry.count / maxCount) * drawHeight;
            return (
              <Circle
                key={entry.date}
                cx={x}
                cy={y}
                fill={primary}
                r={DOT_RADIUS}
              />
            );
          })}
        </Svg>
      )}
    </View>
  );
});

ViewsOverTimeChart.displayName = 'ViewsOverTimeChart';

export default ViewsOverTimeChart;
