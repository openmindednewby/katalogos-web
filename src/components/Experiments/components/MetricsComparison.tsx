/**
 * MetricsComparison -- side-by-side metrics for variant A vs B.
 */
import React from 'react';

import { Text, View } from 'react-native';

import { calculateSignificance, formatMetricPercentage } from '../../../lib/experiments/utils/significance';
import { FM } from '../../../localization/helpers';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { experimentStyles } from '../styles';
import SignificanceIndicator from './SignificanceIndicator';

import type { ExperimentMetrics } from '../../../server/customHooks/experiments/types';

interface Props {
  metrics: ExperimentMetrics;
}

const FULL_WIDTH_PERCENT = 100;

function getBarWidth(views: number, total: number): string {
  if (total === 0) return '0%';
  return `${Math.round((views / total) * FULL_WIDTH_PERCENT)}%`;
}

const MetricsComparison = ({ metrics }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const successColor = theme.semantic.success['500'];

  const significance = calculateSignificance(metrics.variantAViews, metrics.variantBViews);
  const percentA = formatMetricPercentage(metrics.variantAViews, metrics.totalViews);
  const percentB = formatMetricPercentage(metrics.variantBViews, metrics.totalViews);

  return (
    <View style={experimentStyles.metricsContainer} testID={TestIds.EXPERIMENT_METRICS}>
      <Text style={[experimentStyles.heading, { color: colors.text }]}>
        {FM('experiments.metrics.title')}
      </Text>

      <View testID={TestIds.EXPERIMENT_METRICS_VARIANT_A}>
        <View style={experimentStyles.metricRow}>
          <Text style={[experimentStyles.metricLabel, { color: colors.textSecondary }]}>
            {FM('experiments.metrics.variantA')}
          </Text>
          <Text style={[experimentStyles.metricValue, { color: colors.text }]} testID={TestIds.EXPERIMENT_METRICS_VIEWS_A}>
            {String(metrics.variantAViews)}
          </Text>
        </View>
        <Text style={[experimentStyles.metricLabel, { color: colors.textSecondary }]}>
          {FM('experiments.metrics.viewsPercentage', percentA)}
        </Text>
        <View
          accessibilityHint={FM('experiments.metrics.barHint')}
          accessibilityLabel={FM('experiments.metrics.barLabel')}
          style={[experimentStyles.barContainer, { backgroundColor: colors.border }]}
          testID={TestIds.EXPERIMENT_METRICS_BAR_A}
        >
          <View style={[experimentStyles.barFill, { width: getBarWidth(metrics.variantAViews, metrics.totalViews), backgroundColor: primary }]} />
        </View>
      </View>

      <View testID={TestIds.EXPERIMENT_METRICS_VARIANT_B}>
        <View style={experimentStyles.metricRow}>
          <Text style={[experimentStyles.metricLabel, { color: colors.textSecondary }]}>
            {FM('experiments.metrics.variantB')}
          </Text>
          <Text style={[experimentStyles.metricValue, { color: colors.text }]} testID={TestIds.EXPERIMENT_METRICS_VIEWS_B}>
            {String(metrics.variantBViews)}
          </Text>
        </View>
        <Text style={[experimentStyles.metricLabel, { color: colors.textSecondary }]}>
          {FM('experiments.metrics.viewsPercentage', percentB)}
        </Text>
        <View
          accessibilityHint={FM('experiments.metrics.barHint')}
          accessibilityLabel={FM('experiments.metrics.barLabel')}
          style={[experimentStyles.barContainer, { backgroundColor: colors.border }]}
          testID={TestIds.EXPERIMENT_METRICS_BAR_B}
        >
          <View style={[experimentStyles.barFill, { width: getBarWidth(metrics.variantBViews, metrics.totalViews), backgroundColor: successColor }]} />
        </View>
      </View>

      <SignificanceIndicator result={significance} />
    </View>
  );
};

export default MetricsComparison;
