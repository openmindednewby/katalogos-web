/**
 * BillingSettingsScreen - main billing management page.
 * Shows current plan, plan comparison, actions, and billing history.
 */
import React, { useState, useCallback, useMemo } from 'react';

import { ActivityIndicator, Linking, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BillingHistoryTable from './BillingHistoryTable';
import CurrentPlanSection from './CurrentPlanSection';
import PlanComparisonSection from './PlanComparisonSection';
import {
  useGetCurrentSubscription,
  useGetPricingPlans,
  useCreateSubscription,
  useChangePlan,
  useCancelSubscription,
  useGetBillingHistory,
  useCreatePortalSession,
  BILLING_HISTORY_PAGE_SIZE,
} from '../../../../lib/hooks/billing';
import { notifyError, notifySuccess } from '../../../../lib/notifications';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isValueDefined } from '../../../../utils/is';
import Breadcrumb from '../../../Shared/Breadcrumb';
import ConfirmDialog from '../../../Shared/ConfirmDialog';
import Heading from '../../../Shared/Heading';
import Section from '../../../Shared/Section';
import {
  BODY_FONT_SIZE,
  ERROR_TEXT_MARGIN_TOP,
  MEDIUM_SPACING,
  SECTION_SPACING,
} from '../../constants';
import { canCancelSubscription } from '../utils/billingHelpers';

import type BillingCycle from '../../../../lib/hooks/billing/enums/BillingCycle';

const ACTION_PADDING_V = 10;
const ACTION_PADDING_H = 16;
const ACTION_BORDER_RADIUS = 6;
const SECTION_GAP_HEIGHT = 20;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SECTION_SPACING },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: BODY_FONT_SIZE, textAlign: 'center', marginTop: ERROR_TEXT_MARGIN_TOP },
  actionsRow: { flexDirection: 'row', gap: MEDIUM_SPACING, flexWrap: 'wrap' },
  actionButton: { paddingVertical: ACTION_PADDING_V, paddingHorizontal: ACTION_PADDING_H, borderRadius: ACTION_BORDER_RADIUS, borderWidth: 1 },
  actionText: { fontSize: BODY_FONT_SIZE, fontWeight: '600' },
  sectionGap: { height: SECTION_GAP_HEIGHT },
});

const BillingSettingsScreen = (): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];

  const [historyPage, setHistoryPage] = useState(1);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { subscription, isLoading: subLoading } = useGetCurrentSubscription();
  const { plans, isLoading: plansLoading, isError: plansError } = useGetPricingPlans();
  const { history } = useGetBillingHistory(historyPage, BILLING_HISTORY_PAGE_SIZE);

  const subscribeCallbacks = useMemo(() => ({
    onSuccess: (data: { planName: string }) => notifySuccess(FM('settings.billing.messages.subscribeSuccess', data.planName)),
    onError: () => notifyError(FM('settings.billing.messages.subscribeError')),
  }), []);
  const { createSubscription, isPending: subscribing } = useCreateSubscription(subscribeCallbacks);

  const changePlanCallbacks = useMemo(() => ({
    onSuccess: (data: { planName: string }) => notifySuccess(FM('settings.billing.messages.changePlanSuccess', data.planName)),
    onError: () => notifyError(FM('settings.billing.messages.changePlanError')),
  }), []);
  const { changePlan, isPending: changingPlan } = useChangePlan(changePlanCallbacks);

  const cancelCallbacks = useMemo(() => ({
    onSuccess: () => { notifySuccess(FM('settings.billing.messages.cancelSuccess')); setShowCancelDialog(false); },
    onError: () => notifyError(FM('settings.billing.messages.cancelError')),
  }), []);
  const { cancelSubscription, isPending: canceling } = useCancelSubscription(cancelCallbacks);

  const portalCallbacks = useMemo(() => ({
    onSuccess: (data: { url: string }) => { Linking.openURL(data.url).catch(() => {}); },
    onError: () => notifyError(FM('settings.billing.messages.portalError')),
  }), []);
  const { createPortalSession } = useCreatePortalSession(portalCallbacks);

  const handlePlanSelect = useCallback((planId: string, cycle: BillingCycle) => {
    if (isValueDefined(subscription)) changePlan({ planId, billingCycle: cycle });
    else createSubscription({ planId, billingCycle: cycle });
  }, [subscription, changePlan, createSubscription]);

  const handlePortalPress = useCallback(() => {
    createPortalSession('/settings/billing');
  }, [createPortalSession]);

  const handlePrevPage = useCallback(() => setHistoryPage((p) => Math.max(1, p - 1)), []);
  const handleNextPage = useCallback(() => setHistoryPage((p) => p + 1), []);

  if (subLoading || plansLoading)
    return (
      <View style={styles.loadingContainer} testID={TestIds.BILLING_SETTINGS_LOADING}>
        <ActivityIndicator color={primary} size="large" />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{FM('loading')}</Text>
      </View>
    );

  if (plansError)
    return (
      <View style={styles.loadingContainer} testID={TestIds.BILLING_SETTINGS_ERROR}>
        <Text style={[styles.errorText, { color: errorColor }]}>{FM('settings.billing.messages.loadError')}</Text>
      </View>
    );

  const showCancel = isValueDefined(subscription) && canCancelSubscription(subscription.status);
  const isMutating = subscribing || changingPlan || canceling;
  const totalPages = isValueDefined(history) ? Math.ceil(history.totalCount / BILLING_HISTORY_PAGE_SIZE) : 1;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID={TestIds.BILLING_SETTINGS_SCREEN}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Breadcrumb />
        <Heading>{FM('settings.billing.title')}</Heading>

        {isValueDefined(subscription) ? <CurrentPlanSection subscription={subscription} /> : null}
        <View style={styles.sectionGap} />

        <PlanComparisonSection
          currentPlanId={subscription?.planId}
          isSelectDisabled={isMutating}
          plans={plans}
          onPlanSelect={handlePlanSelect}
        />
        <View style={styles.sectionGap} />

        <Section>
          <View style={styles.actionsRow}>
            <TouchableOpacity
              accessibilityHint={FM('settings.billing.managePaymentHint')}
              accessibilityLabel={FM('settings.billing.managePayment')}
              accessibilityRole="button"
              style={[styles.actionButton, { borderColor: primary }]}
              testID={TestIds.BILLING_PORTAL_BUTTON}
              onPress={handlePortalPress}
            >
              <Text style={[styles.actionText, { color: primary }]}>{FM('settings.billing.managePayment')}</Text>
            </TouchableOpacity>

            {showCancel ? (
              <TouchableOpacity
                accessibilityHint={FM('settings.billing.cancelSubscriptionHint')}
                accessibilityLabel={FM('settings.billing.cancelSubscription')}
                accessibilityRole="button"
                style={[styles.actionButton, { borderColor: errorColor }]}
                testID={TestIds.BILLING_CANCEL_BUTTON}
                onPress={() => setShowCancelDialog(true)}
              >
                <Text style={[styles.actionText, { color: errorColor }]}>{FM('settings.billing.cancelSubscription')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </Section>
        <View style={styles.sectionGap} />

        <BillingHistoryTable
          items={history?.items ?? []}
          page={historyPage}
          totalPages={totalPages}
          onNextPage={handleNextPage}
          onPrevPage={handlePrevPage}
        />
      </ScrollView>

      <ConfirmDialog
        destructive
        loading={canceling}
        message={FM('settings.billing.cancelConfirmMessage')}
        title={FM('settings.billing.cancelConfirmTitle')}
        visible={showCancelDialog}
        onCancel={() => setShowCancelDialog(false)}
        onConfirm={cancelSubscription}
      />
    </View>
  );
};

export default BillingSettingsScreen;
