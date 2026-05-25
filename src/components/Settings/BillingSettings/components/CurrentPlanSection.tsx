/**
 * CurrentPlanSection - shows the current plan name, status, and trial countdown.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import StatusBadge from './StatusBadge';
import { TRIAL_WARNING_DAYS } from '../../../../lib/hooks/billing/constants';
import SubscriptionStatus from '../../../../lib/hooks/billing/enums/SubscriptionStatus';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Section from '../../../Shared/Section';
import { BODY_FONT_SIZE, TITLE_FONT_SIZE } from '../../constants';
import { HEADER_MARGIN_BOTTOM } from '../constants';
import { getTrialDaysRemaining } from '../utils/billingHelpers';

import type { Subscription } from '../../../../lib/hooks/billing';

interface Props {
  subscription: Subscription;
}

const COUNTDOWN_MARGIN_TOP = 8;

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: HEADER_MARGIN_BOTTOM,
  },
  planName: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
  },
  countdown: {
    fontSize: BODY_FONT_SIZE,
    marginTop: COUNTDOWN_MARGIN_TOP,
  },
});

const CurrentPlanSection = ({ subscription }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const warningColor = theme.semantic.warning['500'];
  const errorColor = theme.semantic.error['500'];

  const isTrial = subscription.status === SubscriptionStatus.Trial;
  const daysRemaining = isTrial ? getTrialDaysRemaining(subscription.trialEndsAt) : 0;
  const isTrialExpiringSoon = isTrial && daysRemaining <= TRIAL_WARNING_DAYS && daysRemaining > 0;
  const isTrialExpired = isTrial && daysRemaining === 0;

  function getCountdownColor(): string {
    if (isTrialExpired) return errorColor;
    if (isTrialExpiringSoon) return warningColor;
    return colors.textSecondary;
  }

  function getCountdownText(): string {
    if (isTrialExpired) return FM('settings.billing.trialExpired');
    return FM('settings.billing.trialCountdown', String(daysRemaining));
  }

  return (
    <Section>
      <View style={styles.header} testID={TestIds.BILLING_CURRENT_PLAN}>
        <Text style={[styles.planName, { color: colors.text }]}>
          {FM('settings.billing.planName', subscription.planName)}
        </Text>
        <StatusBadge status={subscription.status} />
      </View>

      {isTrial ? (
        <Text
          style={[styles.countdown, { color: getCountdownColor() }]}
          testID={TestIds.BILLING_TRIAL_COUNTDOWN}
        >
          {getCountdownText()}
        </Text>
      ) : null}
    </Section>
  );
};

export default CurrentPlanSection;
