/**
 * DomainStatusBadge - wraps the shared StatusBadge with custom domain status color mapping.
 */
import React, { useMemo } from 'react';

import CustomDomainStatus from '../../../../lib/hooks/customDomain/enums/CustomDomainStatus';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import SharedStatusBadge from '../../../Shared/StatusBadge';
import { BADGE_BG_OPACITY_SUFFIX } from '../constants';

interface Props {
  status: CustomDomainStatus;
}

/** Maps a custom domain status to its translation key. */
function getStatusTranslationKey(status: CustomDomainStatus): string {
  const keyMap: Record<CustomDomainStatus, string> = {
    [CustomDomainStatus.PendingVerification]: 'settings.customDomain.statusPending',
    [CustomDomainStatus.Active]: 'settings.customDomain.statusActive',
    [CustomDomainStatus.Failed]: 'settings.customDomain.statusFailed',
    [CustomDomainStatus.Revoked]: 'settings.customDomain.statusRevoked',
  };

  return keyMap[status];
}

function useStatusColors(status: CustomDomainStatus): { bg: string; text: string } {
  const { theme } = useTheme();
  const success = theme.semantic.success['500'];
  const warning = theme.semantic.warning['500'];
  const error = theme.semantic.error['500'];
  const muted = theme.colors.textSecondary;

  return useMemo(() => {
    switch (status) {
      case CustomDomainStatus.Active:
        return { bg: `${success}${BADGE_BG_OPACITY_SUFFIX}`, text: success };
      case CustomDomainStatus.PendingVerification:
        return { bg: `${warning}${BADGE_BG_OPACITY_SUFFIX}`, text: warning };
      case CustomDomainStatus.Failed:
        return { bg: `${error}${BADGE_BG_OPACITY_SUFFIX}`, text: error };
      case CustomDomainStatus.Revoked:
        return { bg: `${muted}${BADGE_BG_OPACITY_SUFFIX}`, text: muted };
      default:
        return { bg: `${muted}${BADGE_BG_OPACITY_SUFFIX}`, text: muted };
    }
  }, [status, success, warning, error, muted]);
}

const DomainStatusBadge = ({ status }: Props): React.ReactElement => {
  const colors = useStatusColors(status);
  const label = FM(getStatusTranslationKey(status));

  return (
    <SharedStatusBadge
      backgroundColor={colors.bg}
      color={colors.text}
      label={label}
      testID={TestIds.CUSTOM_DOMAIN_STATUS_BADGE}
    />
  );
};

export default DomainStatusBadge;
