/**
 * Utility functions for menu schedule operations.
 * Handles day flag parsing, time formatting, and schedule preview text.
 */
import { FM } from '@/localization/helpers';

import ScheduledDays from '../../../shared/enums/ScheduledDays';

import type { MenuSchedule } from '../../../types/menuTypes';

 

interface DayConfig {
  flag: number;
  labelKey: string;
}

const MAX_HOURS = 23;
const MAX_MINUTES = 59;
const TIME_PARTS_COUNT = 2;
const RADIX = 10;
const MINUTE_PAD_LENGTH = 2;

const DAY_CONFIGS: DayConfig[] = [
  { flag: ScheduledDays.Monday, labelKey: 'onlineMenus.schedule.monday' },
  { flag: ScheduledDays.Tuesday, labelKey: 'onlineMenus.schedule.tuesday' },
  { flag: ScheduledDays.Wednesday, labelKey: 'onlineMenus.schedule.wednesday' },
  { flag: ScheduledDays.Thursday, labelKey: 'onlineMenus.schedule.thursday' },
  { flag: ScheduledDays.Friday, labelKey: 'onlineMenus.schedule.friday' },
  { flag: ScheduledDays.Saturday, labelKey: 'onlineMenus.schedule.saturday' },
  { flag: ScheduledDays.Sunday, labelKey: 'onlineMenus.schedule.sunday' },
];

/** Check if a specific day flag is set in a ScheduledDays value. */
export function isDaySelected(days: number, day: number): boolean {
  return (days & day) === day;
}

/** Toggle a specific day flag in a ScheduledDays value. */
export function toggleDay(days: number, day: number): number {
  return days ^ day;
}

/** Set all weekday flags. */
export function setWeekdays(days: number): number {
  return days | ScheduledDays.Weekdays;
}

/** Set all weekend flags. */
export function setWeekends(days: number): number {
  return days | ScheduledDays.Weekends;
}

/** Get localized labels for all selected days. */
export function getSelectedDayLabels(days: number): string[] {
  return DAY_CONFIGS
    .filter((config) => isDaySelected(days, config.flag))
    .map((config) => FM(config.labelKey));
}

/** Format selected days into a readable summary string. */
function formatDaysSummary(days: number): string {
  const everyDay: number = ScheduledDays.EveryDay;
  if (days === everyDay)
    return FM('onlineMenus.schedule.previewEveryDay');

  const labels = getSelectedDayLabels(days);
  return labels.join(', ');
}

/** Format HH:mm time to a locale-friendly display string (12h). */
export function formatTimeDisplay(time: string): string {
  const parts = time.split(':');
  const EXPECTED_PARTS = 2;
  if (parts.length < EXPECTED_PARTS) return time;

  const hours = parseInt(parts[0], 10);
  const minutes = parts[1];
  const NOON = 12;

  if (isNaN(hours)) return time;

  if (hours === 0) return `12:${minutes} AM`;
  if (hours < NOON) return `${hours}:${minutes} AM`;
  if (hours === NOON) return `12:${minutes} PM`;
  return `${hours - NOON}:${minutes} PM`;
}

/** Build the full schedule preview text. */
export function formatSchedulePreview(schedule: MenuSchedule): string {
  const daysSummary = formatDaysSummary(schedule.scheduledDays);
  const startDisplay = formatTimeDisplay(schedule.startTime);
  const endDisplay = formatTimeDisplay(schedule.endTime);

  return FM(
    'onlineMenus.schedule.preview',
    daysSummary,
    startDisplay,
    endDisplay,
  );
}

/** Build a short public-facing schedule indicator. */
export function formatPublicSchedule(schedule: MenuSchedule): string {
  const daysSummary = formatDaysSummary(schedule.scheduledDays);
  const startDisplay = formatTimeDisplay(schedule.startTime);
  const endDisplay = formatTimeDisplay(schedule.endTime);

  return FM(
    'onlineMenus.schedule.publicIndicator',
    daysSummary,
    startDisplay,
    endDisplay,
  );
}

/** Get the DAY_CONFIGS for external use (e.g., rendering day chips). */
export function getDayConfigs(): DayConfig[] {
  return DAY_CONFIGS;
}

/** Create a default schedule object. */
export function createDefaultSchedule(): MenuSchedule {
  const detectedTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  return {
    scheduledDays: ScheduledDays.EveryDay,
    startTime: '09:00',
    endTime: '17:00',
    isEnabled: true,
    timeZoneId: detectedTimezone !== '' ? detectedTimezone : 'UTC',
  };
}

/** Validate an HH:mm time string. Returns true if valid. */
export function isValidTimeFormat(time: string): boolean {
  if (typeof time !== 'string' || time === '') return false;
  const parts = time.split(':');
  if (parts.length !== TIME_PARTS_COUNT) return false;
  const hours = parseInt(parts[0], RADIX);
  const minutes = parseInt(parts[1], RADIX);
  if (isNaN(hours) || isNaN(minutes)) return false;
  return hours >= 0 && hours <= MAX_HOURS && minutes >= 0 && minutes <= MAX_MINUTES;
}

/** Normalize time input to HH:mm, clamping values. Returns empty string if invalid. */
export function normalizeTimeInput(text: string): string {
  const cleaned = text.replace(/[^0-9:]/g, '');
  const parts = cleaned.split(':');
  if (parts.length !== TIME_PARTS_COUNT) return cleaned;
  const hours = parseInt(parts[0], RADIX);
  const minutes = parseInt(parts[1], RADIX);
  if (isNaN(hours) || isNaN(minutes)) return cleaned;
  const clampedHours = Math.max(0, Math.min(hours, MAX_HOURS));
  const clampedMinutes = Math.max(0, Math.min(minutes, MAX_MINUTES));
  return `${clampedHours}:${String(clampedMinutes).padStart(MINUTE_PAD_LENGTH, '0')}`;
}

/** Common IANA timezone options for the timezone picker. */
export const TIMEZONE_OPTIONS: readonly string[] = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'America/Toronto',
  'America/Vancouver',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Europe/Rome',
  'Europe/Madrid',
  'Europe/Amsterdam',
  'Europe/Athens',
  'Europe/Moscow',
  'Asia/Dubai',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Shanghai',
  'Asia/Tokyo',
  'Asia/Seoul',
  'Australia/Sydney',
  'Australia/Melbourne',
  'Pacific/Auckland',
] as const;

 
