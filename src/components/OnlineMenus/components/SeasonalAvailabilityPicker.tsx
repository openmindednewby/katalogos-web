/**
 * SeasonalAvailabilityPicker - Date range picker for seasonal item availability.
 * Uses month dropdown + validated day input (MM-dd format, no year) for recurring annual availability.
 */
import React, { useCallback, useMemo } from 'react';

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import ModalDropdown from '../../Shared/ModalDropdown';
import {
  daysInMonth,
  formatSeasonalPreview,
  getMonthOptions,
  hasSeasonalAvailability,
  parseMonthDay,
  toMonthDayString,
} from '../utils/seasonalUtils';

interface Props {
  availableFrom: string | null | undefined;
  availableTo: string | null | undefined;
  onUpdate: (from: string | null, to: string | null) => void;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  textSecondary: string;
}

const SECTION_BORDER_RADIUS = 8;
const DEFAULT_MONTH = 1;
const DEFAULT_DAY = 1;
const MIN_DAY = 1;

const styles = StyleSheet.create({
  container: { marginTop: 12, padding: 12, borderWidth: 1, borderRadius: SECTION_BORDER_RADIUS },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  row: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 6 },
  label: { fontSize: 13, fontWeight: '600', minWidth: 40 },
  dayInput: { borderWidth: 1, borderRadius: 6, padding: 6, fontSize: 13, width: 60, textAlign: 'center' },
  separator: { fontSize: 13 },
  previewText: { fontSize: 12, fontStyle: 'italic', marginTop: 8 },
  clearButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, marginTop: 10, alignSelf: 'flex-start' },
  clearButtonText: { fontSize: 12, fontWeight: '600' },
  errorText: { fontSize: 11, marginTop: 2 },
  monthPicker: { flex: 1, maxWidth: 140 },
});

const SeasonalAvailabilityPicker: React.FC<Props> = ({
  availableFrom, availableTo, onUpdate,
  borderColor, textColor, backgroundColor, primaryColor: _primaryColor, textOnPrimary: _textOnPrimary, textSecondary,
}) => {
  const parsedFrom = parseMonthDay(availableFrom);
  const parsedTo = parseMonthDay(availableTo);
  const hasSeasonal = hasSeasonalAvailability(availableFrom, availableTo);
  const preview = formatSeasonalPreview(availableFrom, availableTo);
  const monthOptions = useMemo(() => getMonthOptions(), []);

  const fromMonth = parsedFrom?.month ?? DEFAULT_MONTH;
  const toMonth = parsedTo?.month ?? DEFAULT_MONTH;
  const fromMaxDay = daysInMonth(fromMonth);
  const toMaxDay = daysInMonth(toMonth);

  const handleFromMonthChange = useCallback((month: number) => {
    const day = parsedFrom?.day ?? DEFAULT_DAY;
    const maxDay = daysInMonth(month);
    const clampedDay = day > maxDay ? maxDay : day;
    onUpdate(toMonthDayString(month, clampedDay), availableTo ?? null);
  }, [parsedFrom, availableTo, onUpdate]);

  const handleFromDayChange = useCallback((text: string) => {
    const day = parseInt(text, 10);
    if (isNaN(day)) return;
    const month = parsedFrom?.month ?? DEFAULT_MONTH;
    const maxDay = daysInMonth(month);
    const clampedDay = Math.max(MIN_DAY, Math.min(day, maxDay));
    onUpdate(toMonthDayString(month, clampedDay), availableTo ?? null);
  }, [parsedFrom, availableTo, onUpdate]);

  const handleToMonthChange = useCallback((month: number) => {
    const day = parsedTo?.day ?? DEFAULT_DAY;
    const maxDay = daysInMonth(month);
    const clampedDay = day > maxDay ? maxDay : day;
    onUpdate(availableFrom ?? null, toMonthDayString(month, clampedDay));
  }, [parsedTo, availableFrom, onUpdate]);

  const handleToDayChange = useCallback((text: string) => {
    const day = parseInt(text, 10);
    if (isNaN(day)) return;
    const month = parsedTo?.month ?? DEFAULT_MONTH;
    const maxDay = daysInMonth(month);
    const clampedDay = Math.max(MIN_DAY, Math.min(day, maxDay));
    onUpdate(availableFrom ?? null, toMonthDayString(month, clampedDay));
  }, [parsedTo, availableFrom, onUpdate]);

  const handleClear = useCallback(() => {
    onUpdate(null, null);
  }, [onUpdate]);

  return (
    <View style={[styles.container, { borderColor, backgroundColor }]} testID={TestIds.SEASONAL_PICKER}>
      <Text style={[styles.title, { color: textColor }]}>{FM('onlineMenus.seasonal.title')}</Text>

      <View style={styles.row}>
        <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.seasonal.availableFrom')}</Text>
        <View style={styles.monthPicker}>
          <ModalDropdown
            accessibilityHint={FM('onlineMenus.seasonal.monthPickerHint')}
            accessibilityLabel={FM('onlineMenus.seasonal.monthLabel')}
            options={monthOptions}
            testID={TestIds.SEASONAL_FROM_MONTH_PICKER}
            value={fromMonth}
            onChange={handleFromMonthChange}
          />
        </View>
        <Text style={[styles.separator, { color: textSecondary }]}>/</Text>
        <TextInput
          accessibilityHint={FM('onlineMenus.seasonal.dayHint')}
          accessibilityLabel={FM('onlineMenus.seasonal.dayLabel')}
          keyboardType="number-pad"
          placeholder={FM('onlineMenus.seasonal.dayLabel')}
          placeholderTextColor={textSecondary}
          style={[styles.dayInput, { borderColor, color: textColor, backgroundColor }]}
          testID={TestIds.SEASONAL_FROM_DAY}
          value={isValueDefined(parsedFrom) ? String(parsedFrom.day) : ''}
          onChangeText={handleFromDayChange}
        />
        <Text style={[styles.errorText, { color: textSecondary }]}>
          {FM('onlineMenus.seasonal.dayValidationError', String(fromMaxDay))}
        </Text>
      </View>

      <View style={styles.row}>
        <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.seasonal.availableTo')}</Text>
        <View style={styles.monthPicker}>
          <ModalDropdown
            accessibilityHint={FM('onlineMenus.seasonal.monthPickerHint')}
            accessibilityLabel={FM('onlineMenus.seasonal.monthLabel')}
            options={monthOptions}
            testID={TestIds.SEASONAL_TO_MONTH_PICKER}
            value={toMonth}
            onChange={handleToMonthChange}
          />
        </View>
        <Text style={[styles.separator, { color: textSecondary }]}>/</Text>
        <TextInput
          accessibilityHint={FM('onlineMenus.seasonal.dayHint')}
          accessibilityLabel={FM('onlineMenus.seasonal.dayLabel')}
          keyboardType="number-pad"
          placeholder={FM('onlineMenus.seasonal.dayLabel')}
          placeholderTextColor={textSecondary}
          style={[styles.dayInput, { borderColor, color: textColor, backgroundColor }]}
          testID={TestIds.SEASONAL_TO_DAY}
          value={isValueDefined(parsedTo) ? String(parsedTo.day) : ''}
          onChangeText={handleToDayChange}
        />
        <Text style={[styles.errorText, { color: textSecondary }]}>
          {FM('onlineMenus.seasonal.dayValidationError', String(toMaxDay))}
        </Text>
      </View>

      {preview !== '' && (
        <Text style={[styles.previewText, { color: textSecondary }]} testID={TestIds.SEASONAL_PREVIEW_TEXT}>
          {preview}
        </Text>
      )}

      {hasSeasonal ? <TouchableOpacity
          accessibilityHint={FM('onlineMenus.seasonal.clearHint')}
          accessibilityLabel={FM('onlineMenus.seasonal.clear')}
          accessibilityRole="button"
          style={[styles.clearButton, { backgroundColor: borderColor }]}
          testID={TestIds.SEASONAL_CLEAR_BUTTON}
          onPress={handleClear}
        >
          <Text style={[styles.clearButtonText, { color: textColor }]}>{FM('onlineMenus.seasonal.clear')}</Text>
        </TouchableOpacity> : null}
    </View>
  );
};

export default SeasonalAvailabilityPicker;
