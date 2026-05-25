/** ScheduleEditorForm - Form body for the schedule editor: days, time inputs, timezone, preview, buttons. */
import React, { useMemo } from 'react';

import { Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { scheduleEditorStyles as styles } from './scheduleEditorStyles';
import { TestIds } from '../../../shared/testIds';
import {
  formatSchedulePreview, getDayConfigs,
  isDaySelected, isValidTimeFormat, setWeekdays, setWeekends,
} from '../utils/scheduleUtils';

import type { MenuSchedule } from '../../../types/menuTypes';

interface ScheduleEditorFormProps {
  local: MenuSchedule;
  setLocal: React.Dispatch<React.SetStateAction<MenuSchedule>>;
  hasExisting: boolean;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  textSecondary: string;
  errorColor: string;
  isSaving: boolean;
  onSave: () => void;
  onRemove: () => void;
  onDayToggle: (day: number) => void;
}

export const ScheduleEditorForm: React.FC<ScheduleEditorFormProps> = ({
  local, setLocal, hasExisting, borderColor, textColor, backgroundColor,
  primaryColor, textOnPrimary, textSecondary, errorColor, isSaving,
  onSave, onRemove, onDayToggle,
}) => {
  const dayConfigs = getDayConfigs();
  const previewText = formatSchedulePreview(local);
  const startTimeValid = useMemo(() => isValidTimeFormat(local.startTime), [local.startTime]);
  const endTimeValid = useMemo(() => isValidTimeFormat(local.endTime), [local.endTime]);
  const startBorderColor = startTimeValid ? borderColor : errorColor;
  const endBorderColor = endTimeValid ? borderColor : errorColor;

  return (
    <>
      <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.schedule.days')}</Text>
      <View style={styles.daysRow}>
        {dayConfigs.map((c) => {
          const on = isDaySelected(local.scheduledDays, c.flag);
          return (
            <TouchableOpacity
              key={c.flag}
              accessibilityHint={FM('onlineMenus.schedule.dayToggleHint', FM(c.labelKey))}
              accessibilityLabel={FM(c.labelKey)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: on }}
              style={[styles.chip, { backgroundColor: on ? primaryColor : backgroundColor, borderColor }]}
              testID={`${TestIds.SCHEDULE_DAY_CHIP}-${c.flag}`}
              onPress={() => { onDayToggle(c.flag); }}
            >
              <Text style={[styles.chipText, { color: on ? textOnPrimary : textColor }]}>{FM(c.labelKey)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <View style={styles.quickRow}>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.schedule.weekdaysHint')}
          accessibilityLabel={FM('onlineMenus.schedule.weekdays')}
          accessibilityRole="button"
          style={[styles.quickBtn, { borderColor }]}
          testID={TestIds.SCHEDULE_WEEKDAYS_BUTTON}
          onPress={() => { setLocal((p) => ({ ...p, scheduledDays: setWeekdays(p.scheduledDays) })); }}
        >
          <Text style={[styles.quickBtnText, { color: textColor }]}>{FM('onlineMenus.schedule.weekdays')}</Text>
        </TouchableOpacity>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.schedule.weekendsHint')}
          accessibilityLabel={FM('onlineMenus.schedule.weekends')}
          accessibilityRole="button"
          style={[styles.quickBtn, { borderColor }]}
          testID={TestIds.SCHEDULE_WEEKENDS_BUTTON}
          onPress={() => { setLocal((p) => ({ ...p, scheduledDays: setWeekends(p.scheduledDays) })); }}
        >
          <Text style={[styles.quickBtnText, { color: textColor }]}>{FM('onlineMenus.schedule.weekends')}</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.label, { color: textColor }]}>
        {FM('onlineMenus.schedule.startTime')} - {FM('onlineMenus.schedule.endTime')}
      </Text>
      <View style={styles.timeRow}>
        <View>
          <TextInput
            accessibilityHint={FM('onlineMenus.schedule.timeFormatHint')}
            accessibilityLabel={FM('onlineMenus.schedule.startTimeLabel')}
            placeholder="09:00" placeholderTextColor={textSecondary}
            style={[styles.timeInput, { borderColor: startBorderColor, color: textColor, backgroundColor }]}
            testID={TestIds.SCHEDULE_START_TIME_INPUT} value={local.startTime}
            onChangeText={(t) => { setLocal((p) => ({ ...p, startTime: t })); }}
          />
          {!startTimeValid && local.startTime !== '' ? (
            <Text style={[styles.timeError, { color: errorColor }]} testID={TestIds.SCHEDULE_TIME_ERROR}>
              {FM('onlineMenus.schedule.timeFormatError')}
            </Text>
          ) : null}
        </View>
        <View>
          <TextInput
            accessibilityHint={FM('onlineMenus.schedule.timeFormatHint')}
            accessibilityLabel={FM('onlineMenus.schedule.endTimeLabel')}
            placeholder="17:00" placeholderTextColor={textSecondary}
            style={[styles.timeInput, { borderColor: endBorderColor, color: textColor, backgroundColor }]}
            testID={TestIds.SCHEDULE_END_TIME_INPUT} value={local.endTime}
            onChangeText={(t) => { setLocal((p) => ({ ...p, endTime: t })); }}
          />
          {!endTimeValid && local.endTime !== '' ? (
            <Text style={[styles.timeError, { color: errorColor }]} testID={TestIds.SCHEDULE_TIME_ERROR}>
              {FM('onlineMenus.schedule.timeFormatError')}
            </Text>
          ) : null}
        </View>
      </View>
      <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.schedule.timezone')}</Text>
      <TextInput
        accessibilityHint={FM('onlineMenus.schedule.timezoneHint')}
        accessibilityLabel={FM('onlineMenus.schedule.timezoneLabel')}
        placeholder={FM('onlineMenus.schedule.timezonePlaceholder')} placeholderTextColor={textSecondary}
        style={[styles.tzInput, { borderColor, color: textColor, backgroundColor }]}
        testID={TestIds.SCHEDULE_TIMEZONE_PICKER} value={local.timeZoneId}
        onChangeText={(t) => { setLocal((p) => ({ ...p, timeZoneId: t })); }}
      />
      {previewText !== '' ? (
        <Text style={[styles.preview, { color: textSecondary }]} testID={TestIds.SCHEDULE_PREVIEW_TEXT}>
          {previewText}
        </Text>
      ) : null}
      <View style={styles.btnRow}>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.schedule.saveScheduleHint')}
          accessibilityLabel={FM('onlineMenus.schedule.saveSchedule')}
          accessibilityRole="button"
          disabled={isSaving}
          style={[styles.btn, { backgroundColor: primaryColor }]}
          testID={TestIds.SCHEDULE_SAVE_BUTTON} onPress={onSave}
        >
          <Text style={[styles.btnText, { color: textOnPrimary }]}>{FM('onlineMenus.schedule.saveSchedule')}</Text>
        </TouchableOpacity>
        {hasExisting ? (
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.schedule.removeScheduleHint')}
            accessibilityLabel={FM('onlineMenus.schedule.removeSchedule')}
            accessibilityRole="button"
            disabled={isSaving}
            style={[styles.btn, { backgroundColor: borderColor }]}
            testID={TestIds.SCHEDULE_REMOVE_BUTTON} onPress={onRemove}
          >
            <Text style={[styles.btnText, { color: textColor }]}>{FM('onlineMenus.schedule.removeSchedule')}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </>
  );
};
