/**
 * FreeTierWatermark - "Powered by MenuFlow" watermark for Free tier users.
 * Checks subscription status and only renders for free-tier subscriptions.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { useGetCurrentSubscription } from '../../lib/hooks/billing';
import SubscriptionStatus from '../../lib/hooks/billing/enums/SubscriptionStatus';
import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';
import { WATERMARK_FONT_SIZE, WATERMARK_PADDING } from '../Settings/BillingSettings/constants';

const FREE_PLAN_NAME = 'Free';

const styles = StyleSheet.create({
  container: {
    paddingVertical: WATERMARK_PADDING,
    alignItems: 'center',
  },
  text: {
    fontSize: WATERMARK_FONT_SIZE,
  },
});

function isFreeTier(planName: string, status: SubscriptionStatus): boolean {
  const isFreePlan = planName.toLowerCase() === FREE_PLAN_NAME.toLowerCase();
  const isExpiredOrCanceled = status === SubscriptionStatus.Expired
    || status === SubscriptionStatus.Canceled
    || status === SubscriptionStatus.Suspended;
  return isFreePlan || isExpiredOrCanceled;
}

const FreeTierWatermark = (): React.ReactElement | null => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const { subscription, isLoading } = useGetCurrentSubscription();

  if (isLoading) return null;
  if (!isValueDefined(subscription)) return null;
  if (!isFreeTier(subscription.planName, subscription.status)) return null;

  return (
    <View style={styles.container} testID={TestIds.FREE_TIER_WATERMARK}>
      <Text
        accessibilityHint={FM('settings.billing.watermark.hint')}
        accessibilityLabel={FM('settings.billing.watermark.label')}
        style={[styles.text, { color: colors.textSecondary }]}
      >
        {FM('settings.billing.watermark.text')}
      </Text>
    </View>
  );
};

export default FreeTierWatermark;
