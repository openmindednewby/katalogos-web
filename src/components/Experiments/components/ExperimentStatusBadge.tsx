/**
 * ExperimentStatusBadge -- shows a colored badge for experiment status.
 */
import React, { useMemo } from 'react';

import { Text, View } from 'react-native';

import { FM } from '../../../localization/helpers';
import ExperimentStatus from '../../../shared/enums/ExperimentStatus';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import { hexToRgba } from '../../OnlineMenus/DietaryTags/utils/hexToRgba';
import { experimentStyles } from '../styles';

import type { ResolvedTheme } from '../../../theme/types';

interface Props {
  status: string;
}

const BADGE_BG_OPACITY = 0.15;

function getStatusColors(
  status: string,
  theme: ResolvedTheme,
): { bg: string; text: string } {
  if (status === String(ExperimentStatus.Running)) {
    const textColor = theme.semantic.success['500'];
    return { bg: hexToRgba(textColor, BADGE_BG_OPACITY), text: textColor };
  }

  if (status === String(ExperimentStatus.Completed)) {
    const textColor = theme.palette.primary['500'];
    return { bg: hexToRgba(textColor, BADGE_BG_OPACITY), text: textColor };
  }

  const textColor = theme.colors.textSecondary;
  return { bg: hexToRgba(textColor, BADGE_BG_OPACITY), text: textColor };
}

function getStatusLabel(status: string): string {
  if (status === String(ExperimentStatus.Draft)) return FM('experiments.status.draft');
  if (status === String(ExperimentStatus.Running)) return FM('experiments.status.running');
  if (status === String(ExperimentStatus.Completed)) return FM('experiments.status.completed');
  return status;
}

const ExperimentStatusBadge = ({ status }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const statusColors = useMemo(() => getStatusColors(status, theme), [status, theme]);

  return (
    <View
      style={[experimentStyles.badge, { backgroundColor: statusColors.bg }]}
      testID={TestIds.EXPERIMENT_STATUS_BADGE}
    >
      <Text style={[experimentStyles.badgeText, { color: statusColors.text }]}>
        {getStatusLabel(status)}
      </Text>
    </View>
  );
};

export default ExperimentStatusBadge;
