/**
 * ScheduleIndicator - Shows menu schedule info on the public menu.
 * Displays a subtle text indicator like "Available Monday-Friday, 11:00 AM - 3:00 PM".
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import {
  INDICATOR_FONT_SIZE, INDICATOR_OPACITY, INDICATOR_PADDING_H, INDICATOR_PADDING_V,
} from '../../OnlineMenus/components/scheduleConstants';
import { formatPublicSchedule } from '../../OnlineMenus/utils/scheduleUtils';

import type { MenuSchedule } from '../../../types/menuTypes';

interface Props {
  schedule: MenuSchedule | null | undefined;
  textColor: string;
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: INDICATOR_PADDING_H, paddingVertical: INDICATOR_PADDING_V },
  text: { fontSize: INDICATOR_FONT_SIZE, fontStyle: 'italic', opacity: INDICATOR_OPACITY, textAlign: 'center' },
});

const ScheduleIndicator: React.FC<Props> = ({ schedule, textColor }) => {
  if (!isValueDefined(schedule)) return null;
  if (!schedule.isEnabled) return null;

  const text = formatPublicSchedule(schedule);

  return (
    <View style={styles.container} testID={TestIds.SCHEDULE_PUBLIC_INDICATOR}>
      <Text style={[styles.text, { color: textColor }]}>{text}</Text>
    </View>
  );
};

export default ScheduleIndicator;
