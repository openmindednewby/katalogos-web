/**
 * TenantStatusBadge - wraps the shared StatusBadge with tenant status color mapping.
 *
 * Kept as StatusBadge export for backwards compatibility.
 */
import React, { useMemo } from 'react';

import { FM } from '@/localization/helpers';

import { tenantStatusToColorKey, tenantStatusToLabelKey } from '../../shared/enums/TenantStatus';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import SharedStatusBadge from '../Shared/StatusBadge';

import type { TenantStatusInput } from '../../shared/enums/TenantStatus';
import type { ResolvedSemanticColors } from '../../theme/types';
import type { ThemeModeColors } from '../../theme/types/themeModeColors';

export function resolveSemanticColor(semantic: ResolvedSemanticColors, modeColors: ThemeModeColors, key: string): string {
  if (key === 'success') return semantic.success['500'];
  if (key === 'error') return semantic.error['500'];
  if (key === 'warning') return semantic.warning['500'];
  if (key === 'info') return semantic.info['500'];
  if (key === 'subtext') return modeColors.textSecondary;
  return modeColors.textSecondary;
}

interface Props {
  status?: TenantStatusInput;
  size?: number;
}

const StatusBadge = ({ status }: Props): React.ReactElement => {
  const { theme } = useTheme();

  const colorKey = tenantStatusToColorKey(status);
  const bg = resolveSemanticColor(theme.semantic, theme.colors, colorKey);
  const label = FM(tenantStatusToLabelKey(status));

  const colors = useMemo(() => ({
    bg: `${bg}20`,
    text: bg,
  }), [bg]);

  return (
    <SharedStatusBadge
      backgroundColor={colors.bg}
      color={colors.text}
      label={label}
      testID={TestIds.STATUS_LABEL}
    />
  );
};

export default StatusBadge;
