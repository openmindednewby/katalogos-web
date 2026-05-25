/**
 * GenericStatusBadge - works with any boolean or numeric status.
 * Wraps the shared StatusBadge with active/inactive color mapping.
 */
import React, { useMemo } from 'react';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import SharedStatusBadge from '../Shared/StatusBadge';

interface Props {
  status?: boolean | number;
  translationNs?: string;
  testID?: string;
}

const GenericStatusBadge = ({
  status,
  translationNs = 'tenants',
  testID,
}: Props): React.ReactElement => {
  const { theme } = useTheme();

  const isActive = useMemo(() => {
    if (typeof status === 'boolean') return status;
    if (typeof status === 'number') return status > 0;
    return false;
  }, [status]);

  const colors = useMemo(() => {
    const baseColor = isActive
      ? theme.semantic.success['500']
      : theme.colors.textSecondary;
    return { bg: `${baseColor}20`, text: baseColor };
  }, [isActive, theme.semantic.success, theme.colors.textSecondary]);

  const labelKey = isActive
    ? `${translationNs}.status.enabled`
    : `${translationNs}.status.disabled`;

  return (
    <SharedStatusBadge
      backgroundColor={colors.bg}
      color={colors.text}
      label={FM(labelKey)}
      testID={testID ?? TestIds.STATUS_LABEL}
    />
  );
};

export default GenericStatusBadge;
