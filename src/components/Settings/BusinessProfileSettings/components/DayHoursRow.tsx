import React from 'react';

import { StyleSheet, Switch, Text, TextInput, View } from 'react-native';

import { useBreakpoint } from '../../../../hooks/useBreakpoint';
import { FM } from '../../../../localization/helpers';
import DayOfWeek from '../../../../shared/enums/DayOfWeek';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import {
  BODY_FONT_SIZE,
  DESCRIPTION_FONT_SIZE,
  INPUT_BORDER_RADIUS,
  INPUT_BORDER_WIDTH,
  INPUT_HEIGHT,
  INPUT_PADDING,
  SMALL_SPACING,
  TIME_INPUT_WIDTH,
  TITLE_GAP,
} from '../constants';

const DAY_LABEL_WIDTH = 100;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SMALL_SPACING,
    marginBottom: SMALL_SPACING,
  },
  rowPhone: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  dayLabel: { width: DAY_LABEL_WIDTH, fontSize: BODY_FONT_SIZE },
  dayLabelPhone: { width: 'auto', fontWeight: '600' },
  timeRow: { flexDirection: 'row', gap: SMALL_SPACING, alignItems: 'center' },
  timeInput: {
    width: TIME_INPUT_WIDTH,
    height: INPUT_HEIGHT,
    borderWidth: INPUT_BORDER_WIDTH,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    fontSize: BODY_FONT_SIZE,
    textAlign: 'center',
  },
  closedLabel: { fontSize: DESCRIPTION_FONT_SIZE, marginLeft: TITLE_GAP },
  closedText: { fontSize: BODY_FONT_SIZE, fontStyle: 'italic' },
  switchContainer: { flexDirection: 'row', alignItems: 'center' },
});

const DAY_TRANSLATION_KEYS: Record<DayOfWeek, string> = {
  [DayOfWeek.Monday]: 'settings.businessProfile.days.monday',
  [DayOfWeek.Tuesday]: 'settings.businessProfile.days.tuesday',
  [DayOfWeek.Wednesday]: 'settings.businessProfile.days.wednesday',
  [DayOfWeek.Thursday]: 'settings.businessProfile.days.thursday',
  [DayOfWeek.Friday]: 'settings.businessProfile.days.friday',
  [DayOfWeek.Saturday]: 'settings.businessProfile.days.saturday',
  [DayOfWeek.Sunday]: 'settings.businessProfile.days.sunday',
};

interface Props {
  readonly day: DayOfWeek;
  readonly openTime: string;
  readonly closeTime: string;
  readonly isClosed: boolean;
  readonly onToggleClosed: (day: DayOfWeek) => void;
  readonly onOpenTimeChange: (day: DayOfWeek, time: string) => void;
  readonly onCloseTimeChange: (day: DayOfWeek, time: string) => void;
}

const DayHoursRow = ({
  day,
  openTime,
  closeTime,
  isClosed,
  onToggleClosed,
  onOpenTimeChange,
  onCloseTimeChange,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const { isPhone } = useBreakpoint();
  const dayLabel = FM(DAY_TRANSLATION_KEYS[day]);

  return (
    <View
      style={[styles.row, isPhone ? styles.rowPhone : undefined]}
      testID={`${TestIds.BUSINESS_PROFILE_DAY_ROW}-${String(day)}`}
    >
      <Text style={[styles.dayLabel, isPhone ? styles.dayLabelPhone : undefined, { color: colors.text }]}>
        {dayLabel}
      </Text>

      {isClosed ? (
        <Text style={[styles.closedText, { color: colors.textSecondary }]}>
          {FM('settings.businessProfile.hours.closed')}
        </Text>
      ) : (
        <View style={styles.timeRow}>
          <TextInput
            accessibilityHint={FM('settings.businessProfile.hours.openTimeHint')}
            accessibilityLabel={`${dayLabel} ${FM('settings.businessProfile.hours.open')}`}
            placeholder={FM('settings.businessProfile.hours.openTimePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={[styles.timeInput, { borderColor: colors.border, color: colors.text }]}
            testID={`${TestIds.BUSINESS_PROFILE_DAY_OPEN_INPUT}-${String(day)}`}
            value={openTime}
            onChangeText={text => onOpenTimeChange(day, text)}
          />
          <TextInput
            accessibilityHint={FM('settings.businessProfile.hours.closeTimeHint')}
            accessibilityLabel={`${dayLabel} ${FM('settings.businessProfile.hours.close')}`}
            placeholder={FM('settings.businessProfile.hours.closeTimePlaceholder')}
            placeholderTextColor={colors.textSecondary}
            style={[styles.timeInput, { borderColor: colors.border, color: colors.text }]}
            testID={`${TestIds.BUSINESS_PROFILE_DAY_CLOSE_INPUT}-${String(day)}`}
            value={closeTime}
            onChangeText={text => onCloseTimeChange(day, text)}
          />
        </View>
      )}

      <View style={styles.switchContainer}>
        <Switch
          accessibilityHint={FM('settings.businessProfile.hours.closedSwitchHint')}
          accessibilityLabel={`${dayLabel} ${FM('settings.businessProfile.hours.closed')}`}
          testID={`${TestIds.BUSINESS_PROFILE_DAY_CLOSED_SWITCH}-${String(day)}`}
          value={isClosed}
          onValueChange={() => onToggleClosed(day)}
        />
        <Text style={[styles.closedLabel, { color: colors.textSecondary }]}>
          {FM('settings.businessProfile.hours.closed')}
        </Text>
      </View>
    </View>
  );
};

export default DayHoursRow;
