/**
 * PlanComparisonSection - grid of plan cards with billing cycle toggle.
 */
import React, { useCallback, useState } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import PlanComparisonCard from './PlanComparisonCard';
import { useBreakpoint } from '../../../../hooks/useBreakpoint';
import BillingCycle from '../../../../lib/hooks/billing/enums/BillingCycle';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import Section from '../../../Shared/Section';
import { TITLE_FONT_SIZE } from '../../constants';

import type { PricingPlan } from '../../../../lib/hooks/billing';

interface Props {
  plans: PricingPlan[];
  currentPlanId: string | undefined;
  onPlanSelect: (planId: string, cycle: BillingCycle) => void;
  isSelectDisabled: boolean;
}

const TOGGLE_BORDER_RADIUS = 20;
const TOGGLE_PADDING_H = 16;
const TOGGLE_PADDING_V = 8;
const TOGGLE_FONT_SIZE = 13;
const TRANSPARENT_BG = 'transparent';
const SECTION_TITLE_MARGIN = 12;
const CYCLE_TOGGLE_MARGIN = 20;
const PLAN_GRID_GAP = 16;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
    marginBottom: SECTION_TITLE_MARGIN,
  },
  cycleToggle: {
    flexDirection: 'row',
    alignSelf: 'center',
    borderRadius: TOGGLE_BORDER_RADIUS,
    borderWidth: 1,
    marginBottom: CYCLE_TOGGLE_MARGIN,
    overflow: 'hidden',
  },
  cycleOption: {
    paddingHorizontal: TOGGLE_PADDING_H,
    paddingVertical: TOGGLE_PADDING_V,
  },
  cycleText: {
    fontSize: TOGGLE_FONT_SIZE,
    fontWeight: '600',
  },
  planGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: PLAN_GRID_GAP,
  },
  planGridPhone: {
    flexDirection: 'column',
  },
});

const PlanComparisonSection = ({
  plans,
  currentPlanId,
  onPlanSelect,
  isSelectDisabled,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const { isPhone } = useBreakpoint();

  const [billingCycle, setBillingCycle] = useState<BillingCycle>(BillingCycle.Monthly);

  const handleSelect = useCallback(
    (planId: string) => onPlanSelect(planId, billingCycle),
    [billingCycle, onPlanSelect],
  );

  const isMonthly = billingCycle === BillingCycle.Monthly;

  return (
    <Section>
      <Text style={[styles.sectionTitle, { color: colors.text }]}>
        {FM('settings.billing.comparePlans')}
      </Text>

      <View style={[styles.cycleToggle, { borderColor: colors.border }]} testID={TestIds.BILLING_CYCLE_TOGGLE}>
        <TouchableOpacity
          accessibilityHint={FM('settings.billing.monthlyCycleHint')}
          accessibilityLabel={FM('settings.billing.monthly')}
          accessibilityRole="button"
          style={[styles.cycleOption, { backgroundColor: isMonthly ? primary : TRANSPARENT_BG }]}
          testID={TestIds.BILLING_CYCLE_MONTHLY}
          onPress={() => setBillingCycle(BillingCycle.Monthly)}
        >
          <Text style={[styles.cycleText, { color: isMonthly ? colors.surface : colors.text }]}>
            {FM('settings.billing.monthly')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityHint={FM('settings.billing.annualCycleHint')}
          accessibilityLabel={FM('settings.billing.annual')}
          accessibilityRole="button"
          style={[styles.cycleOption, { backgroundColor: isMonthly ? TRANSPARENT_BG : primary }]}
          testID={TestIds.BILLING_CYCLE_ANNUAL}
          onPress={() => setBillingCycle(BillingCycle.Annual)}
        >
          <Text style={[styles.cycleText, { color: isMonthly ? colors.text : colors.surface }]}>
            {FM('settings.billing.annual')}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={[styles.planGrid, isPhone ? styles.planGridPhone : undefined]}>
        {plans.map((plan) => (
          <PlanComparisonCard
            key={plan.id}
            billingCycle={billingCycle}
            isCurrent={plan.id === currentPlanId}
            isSelectDisabled={isSelectDisabled}
            plan={plan}
            onSelect={handleSelect}
          />
        ))}
      </View>
    </Section>
  );
};

export default PlanComparisonSection;
