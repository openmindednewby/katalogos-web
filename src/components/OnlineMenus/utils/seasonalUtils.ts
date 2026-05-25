/**
 * Utility functions for seasonal item availability.
 * Handles MM-dd date parsing, formatting, and range preview text.
 */
import { FM } from '@/localization/helpers';

import { isValueDefined } from '../../../utils/is';

const MONTH_KEYS = [
  'onlineMenus.seasonal.months.jan',
  'onlineMenus.seasonal.months.feb',
  'onlineMenus.seasonal.months.mar',
  'onlineMenus.seasonal.months.apr',
  'onlineMenus.seasonal.months.may',
  'onlineMenus.seasonal.months.jun',
  'onlineMenus.seasonal.months.jul',
  'onlineMenus.seasonal.months.aug',
  'onlineMenus.seasonal.months.sep',
  'onlineMenus.seasonal.months.oct',
  'onlineMenus.seasonal.months.nov',
  'onlineMenus.seasonal.months.dec',
] as const;

const MONTHS_IN_YEAR = 12;
const MM_DD_SEPARATOR = '-';
const EXPECTED_PARTS = 2;
const RADIX = 10;

const DAYS_31 = 31;
const DAYS_30 = 30;
const DAYS_28 = 28;

/** Days per month (non-leap year), indexed 0-11. */
const DAYS_PER_MONTH = [
  DAYS_31, DAYS_28, DAYS_31, DAYS_30, DAYS_31, DAYS_30,
  DAYS_31, DAYS_31, DAYS_30, DAYS_31, DAYS_30, DAYS_31,
];

interface ParsedMonthDay {
  month: number;
  day: number;
}

/** Parse a MM-dd string into month and day numbers. Returns null if invalid. */
export function parseMonthDay(value: string | null | undefined): ParsedMonthDay | null {
  if (typeof value !== 'string' || value === '') return null;

  const parts = value.split(MM_DD_SEPARATOR);
  if (parts.length !== EXPECTED_PARTS) return null;

  const month = parseInt(parts[0], RADIX);
  const day = parseInt(parts[1], RADIX);

  if (isNaN(month) || isNaN(day)) return null;
  if (month < 1 || month > MONTHS_IN_YEAR) return null;
  if (day < 1 || day > daysInMonth(month)) return null;

  return { month, day };
}

/** Format a MM-dd string into a readable display (e.g., "Sep 1"). */
export function formatMonthDay(value: string | null | undefined): string {
  const parsed = parseMonthDay(value);
  if (!isValueDefined(parsed)) return '';

  const monthIndex = parsed.month - 1;
  const monthLabel = FM(MONTH_KEYS[monthIndex]);
  return `${monthLabel} ${parsed.day}`;
}

/** Build a MM-dd string from month and day numbers. */
export function toMonthDayString(month: number, day: number): string {
  const paddedMonth = String(month).padStart(EXPECTED_PARTS, '0');
  const paddedDay = String(day).padStart(EXPECTED_PARTS, '0');
  return `${paddedMonth}${MM_DD_SEPARATOR}${paddedDay}`;
}

/** Check if a date range wraps around the year boundary (e.g., Nov - Feb). */
export function isWrappingRange(from: string | null | undefined, to: string | null | undefined): boolean {
  const parsedFrom = parseMonthDay(from);
  const parsedTo = parseMonthDay(to);

  if (!isValueDefined(parsedFrom) || !isValueDefined(parsedTo)) return false;

  const fromOrdinal = parsedFrom.month * 100 + parsedFrom.day;
  const toOrdinal = parsedTo.month * 100 + parsedTo.day;

  return fromOrdinal > toOrdinal;
}

/** Format seasonal availability preview text. */
export function formatSeasonalPreview(
  from: string | null | undefined,
  to: string | null | undefined,
): string {
  const hasFrom = typeof from === 'string' && from !== '';
  const hasTo = typeof to === 'string' && to !== '';

  if (hasFrom && hasTo) {
    const fromDisplay = formatMonthDay(from);
    const toDisplay = formatMonthDay(to);
    const wraps = isWrappingRange(from, to);

    if (wraps)
      return FM('onlineMenus.seasonal.previewWraps', fromDisplay, toDisplay);

    return FM('onlineMenus.seasonal.previewRange', fromDisplay, toDisplay);
  }

  if (hasFrom)
    return FM('onlineMenus.seasonal.previewFrom', formatMonthDay(from));

  if (hasTo)
    return FM('onlineMenus.seasonal.previewTo', formatMonthDay(to));

  return '';
}

/** Check if a menu item has seasonal availability set. */
export function hasSeasonalAvailability(
  from: string | null | undefined,
  to: string | null | undefined,
): boolean {
  const hasFrom = typeof from === 'string' && from !== '';
  const hasTo = typeof to === 'string' && to !== '';
  return hasFrom || hasTo;
}

/** Get the maximum number of days in a given month (non-leap year). */
export function daysInMonth(month: number): number {
  const index = month - 1;

  if (index < 0 || index >= MONTHS_IN_YEAR) return DAYS_31;

  return DAYS_PER_MONTH[index];
}

/** Get month options for picker (1-12 with localized labels). */
export function getMonthOptions(): Array<{ value: number; label: string }> {
  return MONTH_KEYS.map((key, index) => ({
    value: index + 1,
    label: FM(key),
  }));
}

/** Get day options for a given month (1 to daysInMonth). */
export function getDayOptions(month: number): Array<{ value: number; label: string }> {
  const maxDays = daysInMonth(month);
  const options: Array<{ value: number; label: string }> = [];

  for (let d = 1; d <= maxDays; d++)
    options.push({ value: d, label: String(d) });

  return options;
}
