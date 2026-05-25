/**
 * SignificanceIndicator -- displays the statistical significance result.
 */
import React from 'react';

import { Text, View } from 'react-native';

import SignificanceResult from '../../../lib/experiments/utils/significance';
import { FM } from '../../../localization/helpers';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { experimentStyles } from '../styles';

import type { ResolvedTheme } from '../../../theme/types';

interface Props {
  result: SignificanceResult;
}

function getSignificanceKey(result: SignificanceResult): string {
  if (result === SignificanceResult.VariantBWinning)
    return 'experiments.significance.variantBWinning';

  if (result === SignificanceResult.VariantAWinning)
    return 'experiments.significance.variantAWinning';

  if (result === SignificanceResult.NoClearWinner)
    return 'experiments.significance.noClearWinner';

  return 'experiments.significance.notEnoughData';
}

function getSignificanceColor(result: SignificanceResult, theme: ResolvedTheme): string {
  if (result === SignificanceResult.VariantBWinning)
    return theme.semantic.success['500'];

  if (result === SignificanceResult.VariantAWinning)
    return theme.palette.primary['500'];

  return theme.colors.textSecondary;
}

const SignificanceIndicator = ({ result }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const textColor = getSignificanceColor(result, theme);

  return (
    <View testID={TestIds.EXPERIMENT_SIGNIFICANCE}>
      <Text style={[experimentStyles.metricLabel, { color: theme.colors.textSecondary }]}>
        {FM('experiments.significance.label')}
      </Text>
      <Text style={[experimentStyles.metricValue, { color: textColor }]}>
        {FM(getSignificanceKey(result))}
      </Text>
    </View>
  );
};

export default SignificanceIndicator;
