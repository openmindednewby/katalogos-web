import React, { memo, useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import TimePeriod from '@/shared/enums/TimePeriod';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

const BUTTON_PADDING_VERTICAL = 6;
const BUTTON_PADDING_HORIZONTAL = 14;
const BUTTON_BORDER_RADIUS = 16;
const BUTTON_FONT_SIZE = 13;
const GAP = 8;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: GAP,
  },
  button: {
    paddingVertical: BUTTON_PADDING_VERTICAL,
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  buttonText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '600',
  },
});

interface TimePeriodSelectorProps {
  selectedPeriod: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}

const PERIODS: ReadonlyArray<{ value: TimePeriod; labelKey: string }> = [
  { value: TimePeriod.Today, labelKey: 'analytics.popularItems.timePeriod.today' },
  { value: TimePeriod.SevenDays, labelKey: 'analytics.popularItems.timePeriod.sevenDays' },
  { value: TimePeriod.ThirtyDays, labelKey: 'analytics.popularItems.timePeriod.thirtyDays' },
] as const;

const TimePeriodSelector = memo(({
  selectedPeriod,
  onPeriodChange,
}: TimePeriodSelectorProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];

  const renderButton = useCallback(
    (period: { value: TimePeriod; labelKey: string }): React.ReactElement => {
      const isActive = selectedPeriod === period.value;
      const label = FM(period.labelKey);

      return (
        <TouchableOpacity
          key={period.value}
          accessibilityHint={FM('analytics.popularItems.timePeriod.buttonHint', label)}
          accessibilityLabel={label}
          accessibilityRole="button"
          accessibilityState={{ selected: isActive }}
          style={[
            styles.button,
            { backgroundColor: isActive ? primary : colors.surface },
          ]}
          testID={`${TestIds.POPULAR_ITEMS_TIME_BUTTON}-${period.value}`}
          onPress={() => { onPeriodChange(period.value); }}
        >
          <Text
            style={[
              styles.buttonText,
              { color: isActive ? colors.background : colors.textSecondary },
            ]}
          >
            {label}
          </Text>
        </TouchableOpacity>
      );
    },
    [selectedPeriod, colors, primary, onPeriodChange],
  );

  return (
    <View
      accessibilityHint={FM('analytics.popularItems.timePeriod.selectorHint')}
      accessibilityRole="tablist"
      style={styles.container}
      testID={TestIds.POPULAR_ITEMS_TIME_SELECTOR}
    >
      {PERIODS.map(renderButton)}
    </View>
  );
});

TimePeriodSelector.displayName = 'TimePeriodSelector';

export default TimePeriodSelector;
