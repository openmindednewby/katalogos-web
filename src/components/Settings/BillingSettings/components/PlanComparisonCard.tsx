/**
 * PlanComparisonCard - single plan card in the comparison grid.
 * Shows plan name, price, features, and action button.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import BillingCycle from '../../../../lib/hooks/billing/enums/BillingCycle';
import { FM } from '../../../../localization/helpers';
import { DISABLED_OPACITY } from '../../../../shared/constants';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import {
  CHECKMARK_MARGIN_TOP,
  CHECKMARK_SYMBOL,
  DEFAULT_BORDER_WIDTH,
  DIVIDER_HEIGHT,
  DIVIDER_MARGIN_V,
  FEATURE_FONT_SIZE,
  FEATURE_LINE_HEIGHT,
  FEATURE_ROW_GAP,
  HIGHLIGHTED_BORDER_WIDTH,
  PERIOD_MARGIN_LEFT,
  PLAN_CARD_BORDER_RADIUS,
  PLAN_CARD_MIN_WIDTH,
  PLAN_CARD_PADDING,
  PLAN_NAME_FONT_SIZE,
  PLAN_PRICE_FONT_SIZE,
  PRICE_LABEL_FONT_SIZE,
  PRICE_ROW_MARGIN_BOTTOM,
} from '../constants';

import type { PricingPlan } from '../../../../lib/hooks/billing';


interface Props {
  plan: PricingPlan;
  billingCycle: BillingCycle;
  isCurrent: boolean;
  onSelect: (planId: string) => void;
  isSelectDisabled: boolean;
}

const CTA_PADDING_V = 12;
const CTA_BORDER_RADIUS = 8;
const FULL_OPACITY = 1;
const POPULAR_FONT_SIZE = 11;
const CURRENT_FONT_SIZE = 11;
const NAME_MARGIN = 8;
const FEATURE_GAP = 10;
const FEATURE_LIST_MARGIN = 20;

const styles = StyleSheet.create({
  card: {
    padding: PLAN_CARD_PADDING,
    borderRadius: PLAN_CARD_BORDER_RADIUS,
    borderWidth: DEFAULT_BORDER_WIDTH,
    flex: 1,
    minWidth: PLAN_CARD_MIN_WIDTH,
  },
  cardHighlighted: { borderWidth: HIGHLIGHTED_BORDER_WIDTH },
  popularBadge: { fontSize: POPULAR_FONT_SIZE, fontWeight: '700', marginBottom: NAME_MARGIN },
  name: { fontSize: PLAN_NAME_FONT_SIZE, fontWeight: '700', marginBottom: NAME_MARGIN },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', marginBottom: PRICE_ROW_MARGIN_BOTTOM },
  price: { fontSize: PLAN_PRICE_FONT_SIZE, fontWeight: '800' },
  period: { fontSize: PRICE_LABEL_FONT_SIZE, marginLeft: PERIOD_MARGIN_LEFT },
  divider: { height: DIVIDER_HEIGHT, marginVertical: DIVIDER_MARGIN_V },
  featureList: { gap: FEATURE_GAP, marginBottom: FEATURE_LIST_MARGIN },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: FEATURE_ROW_GAP },
  checkmark: { fontSize: FEATURE_FONT_SIZE, marginTop: CHECKMARK_MARGIN_TOP },
  featureText: { fontSize: FEATURE_FONT_SIZE, lineHeight: FEATURE_LINE_HEIGHT, flex: 1 },
  cta: {
    paddingVertical: CTA_PADDING_V,
    borderRadius: CTA_BORDER_RADIUS,
    alignItems: 'center',
  },
  ctaText: { fontSize: PRICE_LABEL_FONT_SIZE, fontWeight: '700' },
  currentBadge: { fontSize: CURRENT_FONT_SIZE, fontWeight: '600', textAlign: 'center' },
});

function getDisplayPrice(plan: PricingPlan, cycle: BillingCycle): string {
  const price = cycle === BillingCycle.Annual ? plan.annualPrice : plan.monthlyPrice;
  if (price === 0) return FM('settings.billing.free');
  return `$${String(price)}`;
}

function getPeriodLabel(plan: PricingPlan, cycle: BillingCycle): string {
  if (plan.monthlyPrice === 0) return '';
  return cycle === BillingCycle.Annual
    ? FM('settings.billing.perYear')
    : FM('settings.billing.perMonth');
}

const PlanComparisonCard = ({
  plan,
  billingCycle,
  isCurrent,
  onSelect,
  isSelectDisabled,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];

  const isHighlighted = plan.isPopular || isCurrent;
  const borderColor = isHighlighted ? primary : colors.border;

  const cardStyle = isHighlighted
    ? [styles.card, styles.cardHighlighted, { backgroundColor: colors.surface, borderColor }]
    : [styles.card, { backgroundColor: colors.surface, borderColor }];

  const ctaLabel = isCurrent
    ? FM('settings.billing.currentPlanBadge')
    : FM('settings.billing.selectPlan');

  const ctaHint = FM('settings.billing.selectPlanHint', plan.name);

  function handlePress(): void {
    onSelect(plan.id);
  }

  return (
    <View style={cardStyle} testID={TestIds.BILLING_PLAN_CARD}>
      {plan.isPopular ? (
        <Text style={[styles.popularBadge, { color: primary }]}>
          {FM('settings.billing.popular')}
        </Text>
      ) : null}

      <Text style={[styles.name, { color: colors.text }]}>{plan.name}</Text>

      <View style={styles.priceRow}>
        <Text style={[styles.price, { color: colors.text }]}>
          {getDisplayPrice(plan, billingCycle)}
        </Text>
        <Text style={[styles.period, { color: colors.textSecondary }]}>
          {getPeriodLabel(plan, billingCycle)}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.featureList}>
        {plan.features.map((feature) => (
          <View key={feature.code} style={styles.featureRow}>
            <Text style={[styles.checkmark, { color: primary }]}>{CHECKMARK_SYMBOL}</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>{feature.name}</Text>
          </View>
        ))}
      </View>

      {isCurrent ? (
        <Text style={[styles.currentBadge, { color: primary }]}>
          {FM('settings.billing.currentPlanBadge')}
        </Text>
      ) : (
        <TouchableOpacity
          accessibilityHint={ctaHint}
          accessibilityLabel={ctaLabel}
          accessibilityRole="button"
          disabled={isSelectDisabled}
          style={[styles.cta, { backgroundColor: primary, opacity: isSelectDisabled ? DISABLED_OPACITY : FULL_OPACITY }]}
          testID={TestIds.BILLING_PLAN_SELECT_BUTTON}
          onPress={handlePress}
        >
          <Text style={[styles.ctaText, { color: colors.surface }]}>{ctaLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

export default PlanComparisonCard;
