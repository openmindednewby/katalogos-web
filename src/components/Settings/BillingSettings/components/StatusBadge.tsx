/**
 * BillingStatusBadge - wraps the shared StatusBadge with subscription status color mapping.
 */
import React, { useMemo } from 'react';

import SubscriptionStatus from '../../../../lib/hooks/billing/enums/SubscriptionStatus';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import SharedStatusBadge from '../../../Shared/StatusBadge';
import { getStatusTranslationKey } from '../utils/billingHelpers';

interface Props {
  status: SubscriptionStatus;
}

function useStatusColors(status: SubscriptionStatus): { bg: string; text: string } {
  const { theme } = useTheme();
  const success = theme.semantic.success['500'];
  const warning = theme.semantic.warning['500'];
  const error = theme.semantic.error['500'];
  const info = theme.palette.primary['500'];
  const muted = theme.colors.textSecondary;

  return useMemo(() => {
    switch (status) {
      case SubscriptionStatus.Active:
        return { bg: `${success}20`, text: success };
      case SubscriptionStatus.Trial:
        return { bg: `${info}20`, text: info };
      case SubscriptionStatus.PastDue:
        return { bg: `${warning}20`, text: warning };
      case SubscriptionStatus.Canceled:
      case SubscriptionStatus.Expired:
      case SubscriptionStatus.Suspended:
        return { bg: `${error}20`, text: error };
      default:
        return { bg: `${muted}20`, text: muted };
    }
  }, [status, success, warning, error, info, muted]);
}

const StatusBadge = ({ status }: Props): React.ReactElement => {
  const colors = useStatusColors(status);
  const label = FM(getStatusTranslationKey(status));

  return (
    <SharedStatusBadge
      backgroundColor={colors.bg}
      color={colors.text}
      label={label}
      testID={TestIds.BILLING_STATUS_BADGE}
    />
  );
};

export default StatusBadge;
