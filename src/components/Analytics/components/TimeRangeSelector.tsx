import React, { memo, useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import AnalyticsTimeRange from '@/shared/enums/AnalyticsTimeRange';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

const BUTTON_PADDING_VERTICAL = 8;
const BUTTON_PADDING_HORIZONTAL = 14;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_FONT_SIZE = 13;
const CONTAINER_GAP = 8;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: CONTAINER_GAP,
    flexWrap: 'wrap',
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

interface TimeRangeSelectorProps {
  selected: AnalyticsTimeRange;
  onSelect: (range: AnalyticsTimeRange) => void;
}

const RANGE_OPTIONS: readonly AnalyticsTimeRange[] = [
  AnalyticsTimeRange.Today,
  AnalyticsTimeRange.SevenDays,
  AnalyticsTimeRange.ThirtyDays,
] as const;

const RANGE_LABEL_KEYS: Record<string, string> = {
  [AnalyticsTimeRange.Today]: 'analytics.detail.timeRange.today',
  [AnalyticsTimeRange.SevenDays]: 'analytics.detail.timeRange.sevenDays',
  [AnalyticsTimeRange.ThirtyDays]: 'analytics.detail.timeRange.thirtyDays',
  [AnalyticsTimeRange.Custom]: 'analytics.detail.timeRange.custom',
};

const TimeRangeSelector = memo(({
  selected,
  onSelect,
}: TimeRangeSelectorProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];

  const handlePress = useCallback(
    (range: AnalyticsTimeRange) => () => onSelect(range),
    [onSelect],
  );

  return (
    <View
      accessibilityRole="tablist"
      style={styles.container}
      testID={TestIds.MENU_ANALYTICS_TIME_RANGE}
    >
      {RANGE_OPTIONS.map((range) => {
        const isSelected = range === selected;
        const label = FM(RANGE_LABEL_KEYS[range] ?? 'analytics.detail.timeRange.today');
        return (
          <TouchableOpacity
            key={range}
            accessibilityHint={FM('analytics.detail.timeRange.buttonHint', label)}
            accessibilityLabel={label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isSelected }}
            style={[
              styles.button,
              {
                backgroundColor: isSelected
                  ? primary
                  : colors.surface,
              },
            ]}
            testID={`${TestIds.MENU_ANALYTICS_TIME_RANGE}-${range}`}
            onPress={handlePress(range)}
          >
            <Text
              style={[
                styles.buttonText,
                {
                  color: isSelected
                    ? colors.background
                    : colors.text,
                },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
});

TimeRangeSelector.displayName = 'TimeRangeSelector';

export default TimeRangeSelector;
