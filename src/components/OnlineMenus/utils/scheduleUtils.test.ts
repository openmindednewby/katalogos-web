/**
 * Tests for schedule utility functions.
 * Focuses on day flag operations, time formatting, and schedule preview logic.
 */
import {
  isDaySelected,
  toggleDay,
  setWeekdays,
  setWeekends,
  getSelectedDayLabels,
  formatTimeDisplay,
  createDefaultSchedule,
  isValidTimeFormat,
  normalizeTimeInput,
} from './scheduleUtils';
import ScheduledDays from '../../../shared/enums/ScheduledDays';

jest.mock('@/localization/helpers', () => ({
  FM: (key: string) => {
    const map: Record<string, string> = {
      'onlineMenus.schedule.monday': 'Mon',
      'onlineMenus.schedule.tuesday': 'Tue',
      'onlineMenus.schedule.wednesday': 'Wed',
      'onlineMenus.schedule.thursday': 'Thu',
      'onlineMenus.schedule.friday': 'Fri',
      'onlineMenus.schedule.saturday': 'Sat',
      'onlineMenus.schedule.sunday': 'Sun',
      'onlineMenus.schedule.previewEveryDay': 'every day',
    };
    return map[key] ?? key;
  },
}));

describe('isDaySelected', () => {
  it('returns true when a specific day flag is set', () => {
    const days = ScheduledDays.Monday | ScheduledDays.Wednesday;
    expect(isDaySelected(days, ScheduledDays.Monday)).toBe(true);
    expect(isDaySelected(days, ScheduledDays.Wednesday)).toBe(true);
  });

  it('returns false when a specific day flag is not set', () => {
    const days = ScheduledDays.Monday | ScheduledDays.Wednesday;
    expect(isDaySelected(days, ScheduledDays.Tuesday)).toBe(false);
    expect(isDaySelected(days, ScheduledDays.Sunday)).toBe(false);
  });

  it('handles EveryDay flag correctly', () => {
    expect(isDaySelected(ScheduledDays.EveryDay, ScheduledDays.Monday)).toBe(true);
    expect(isDaySelected(ScheduledDays.EveryDay, ScheduledDays.Sunday)).toBe(true);
  });

  it('handles None flag correctly', () => {
    expect(isDaySelected(ScheduledDays.None, ScheduledDays.Monday)).toBe(false);
  });
});

describe('toggleDay', () => {
  it('adds a day flag when not present', () => {
    const result = toggleDay(ScheduledDays.None, ScheduledDays.Monday);
    expect(isDaySelected(result, ScheduledDays.Monday)).toBe(true);
  });

  it('removes a day flag when present', () => {
    const result = toggleDay(ScheduledDays.Monday, ScheduledDays.Monday);
    expect(isDaySelected(result, ScheduledDays.Monday)).toBe(false);
  });

  it('preserves other flags when toggling', () => {
    const days = ScheduledDays.Monday | ScheduledDays.Wednesday;
    const result = toggleDay(days, ScheduledDays.Wednesday);
    expect(isDaySelected(result, ScheduledDays.Monday)).toBe(true);
    expect(isDaySelected(result, ScheduledDays.Wednesday)).toBe(false);
  });
});

describe('setWeekdays', () => {
  it('adds all weekday flags', () => {
    const result = setWeekdays(ScheduledDays.None);
    expect(isDaySelected(result, ScheduledDays.Monday)).toBe(true);
    expect(isDaySelected(result, ScheduledDays.Tuesday)).toBe(true);
    expect(isDaySelected(result, ScheduledDays.Wednesday)).toBe(true);
    expect(isDaySelected(result, ScheduledDays.Thursday)).toBe(true);
    expect(isDaySelected(result, ScheduledDays.Friday)).toBe(true);
  });

  it('does not add weekend flags', () => {
    const result = setWeekdays(ScheduledDays.None);
    expect(isDaySelected(result, ScheduledDays.Saturday)).toBe(false);
    expect(isDaySelected(result, ScheduledDays.Sunday)).toBe(false);
  });

  it('preserves existing weekend flags', () => {
    const result = setWeekdays(ScheduledDays.Saturday);
    expect(isDaySelected(result, ScheduledDays.Saturday)).toBe(true);
    expect(isDaySelected(result, ScheduledDays.Monday)).toBe(true);
  });
});

describe('setWeekends', () => {
  it('adds Saturday and Sunday flags', () => {
    const result = setWeekends(ScheduledDays.None);
    expect(isDaySelected(result, ScheduledDays.Saturday)).toBe(true);
    expect(isDaySelected(result, ScheduledDays.Sunday)).toBe(true);
  });

  it('preserves existing weekday flags', () => {
    const result = setWeekends(ScheduledDays.Monday);
    expect(isDaySelected(result, ScheduledDays.Monday)).toBe(true);
    expect(isDaySelected(result, ScheduledDays.Saturday)).toBe(true);
  });
});

describe('getSelectedDayLabels', () => {
  it('returns labels for selected days', () => {
    const days = ScheduledDays.Monday | ScheduledDays.Friday;
    const labels = getSelectedDayLabels(days);
    expect(labels).toEqual(['Mon', 'Fri']);
  });

  it('returns all day labels for EveryDay', () => {
    const TOTAL_DAYS = 7;
    const labels = getSelectedDayLabels(ScheduledDays.EveryDay);
    expect(labels).toHaveLength(TOTAL_DAYS);
  });

  it('returns empty array for None', () => {
    const labels = getSelectedDayLabels(ScheduledDays.None);
    expect(labels).toEqual([]);
  });
});

describe('formatTimeDisplay', () => {
  it('formats midnight as 12:00 AM', () => {
    expect(formatTimeDisplay('00:00')).toBe('12:00 AM');
  });

  it('formats morning time correctly', () => {
    expect(formatTimeDisplay('09:30')).toBe('9:30 AM');
  });

  it('formats noon as 12:00 PM', () => {
    expect(formatTimeDisplay('12:00')).toBe('12:00 PM');
  });

  it('formats afternoon time correctly', () => {
    expect(formatTimeDisplay('14:30')).toBe('2:30 PM');
  });

  it('formats late night time correctly', () => {
    expect(formatTimeDisplay('23:59')).toBe('11:59 PM');
  });

  it('returns input for invalid time string', () => {
    expect(formatTimeDisplay('invalid')).toBe('invalid');
  });
});

describe('createDefaultSchedule', () => {
  it('creates a schedule with EveryDay selected', () => {
    const schedule = createDefaultSchedule();
    expect(schedule.scheduledDays).toBe(ScheduledDays.EveryDay);
  });

  it('creates an enabled schedule', () => {
    const schedule = createDefaultSchedule();
    expect(schedule.isEnabled).toBe(true);
  });

  it('sets default time range to 09:00-17:00', () => {
    const schedule = createDefaultSchedule();
    expect(schedule.startTime).toBe('09:00');
    expect(schedule.endTime).toBe('17:00');
  });

  it('detects a timezone', () => {
    const schedule = createDefaultSchedule();
    expect(schedule.timeZoneId).toBeTruthy();
  });
});

describe('isValidTimeFormat', () => {
  it('accepts valid HH:mm times', () => {
    expect(isValidTimeFormat('00:00')).toBe(true);
    expect(isValidTimeFormat('09:30')).toBe(true);
    expect(isValidTimeFormat('23:59')).toBe(true);
    expect(isValidTimeFormat('12:00')).toBe(true);
  });

  it('rejects times with hours out of range', () => {
    expect(isValidTimeFormat('24:00')).toBe(false);
    expect(isValidTimeFormat('25:00')).toBe(false);
  });

  it('rejects times with minutes out of range', () => {
    expect(isValidTimeFormat('12:60')).toBe(false);
    expect(isValidTimeFormat('12:99')).toBe(false);
  });

  it('rejects invalid formats', () => {
    expect(isValidTimeFormat('')).toBe(false);
    expect(isValidTimeFormat('invalid')).toBe(false);
    expect(isValidTimeFormat('12')).toBe(false);
    expect(isValidTimeFormat('12:30:00')).toBe(false);
  });
});

describe('normalizeTimeInput', () => {
  it('passes through valid times unchanged', () => {
    expect(normalizeTimeInput('09:30')).toBe('9:30');
    expect(normalizeTimeInput('12:00')).toBe('12:00');
  });

  it('clamps hours to 0-23', () => {
    expect(normalizeTimeInput('25:00')).toBe('23:00');
  });

  it('clamps minutes to 0-59', () => {
    expect(normalizeTimeInput('12:75')).toBe('12:59');
  });

  it('strips non-numeric characters except colon', () => {
    expect(normalizeTimeInput('12:3a0')).toBe('12:30');
  });

  it('returns cleaned input when not two parts', () => {
    expect(normalizeTimeInput('1230')).toBe('1230');
  });
});
