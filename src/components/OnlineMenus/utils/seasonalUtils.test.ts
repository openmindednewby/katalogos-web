/**
 * Tests for seasonal availability utility functions.
 * Focuses on date parsing, formatting, range detection, and preview text.
 */
import {
  parseMonthDay,
  formatMonthDay,
  toMonthDayString,
  isWrappingRange,
  hasSeasonalAvailability,
  daysInMonth,
  getMonthOptions,
  getDayOptions,
} from './seasonalUtils';

jest.mock('@/localization/helpers', () => ({
  FM: (key: string) => {
    const map: Record<string, string> = {
      'onlineMenus.seasonal.months.jan': 'Jan',
      'onlineMenus.seasonal.months.feb': 'Feb',
      'onlineMenus.seasonal.months.mar': 'Mar',
      'onlineMenus.seasonal.months.apr': 'Apr',
      'onlineMenus.seasonal.months.may': 'May',
      'onlineMenus.seasonal.months.jun': 'Jun',
      'onlineMenus.seasonal.months.jul': 'Jul',
      'onlineMenus.seasonal.months.aug': 'Aug',
      'onlineMenus.seasonal.months.sep': 'Sep',
      'onlineMenus.seasonal.months.oct': 'Oct',
      'onlineMenus.seasonal.months.nov': 'Nov',
      'onlineMenus.seasonal.months.dec': 'Dec',
    };
    return map[key] ?? key;
  },
}));

describe('parseMonthDay', () => {
  it('parses valid MM-dd string', () => {
    expect(parseMonthDay('09-01')).toEqual({ month: 9, day: 1 });
    expect(parseMonthDay('12-31')).toEqual({ month: 12, day: 31 });
  });

  it('parses single-digit month and day', () => {
    expect(parseMonthDay('01-01')).toEqual({ month: 1, day: 1 });
  });

  it('returns null for null/undefined/empty', () => {
    expect(parseMonthDay(null)).toBeNull();
    expect(parseMonthDay(undefined)).toBeNull();
    expect(parseMonthDay('')).toBeNull();
  });

  it('returns null for invalid format', () => {
    expect(parseMonthDay('invalid')).toBeNull();
    expect(parseMonthDay('2024-09-01')).toBeNull();
  });

  it('returns null for out-of-range month', () => {
    expect(parseMonthDay('13-01')).toBeNull();
    expect(parseMonthDay('00-01')).toBeNull();
  });

  it('returns null for out-of-range day', () => {
    expect(parseMonthDay('02-30')).toBeNull();
    expect(parseMonthDay('01-32')).toBeNull();
    expect(parseMonthDay('09-00')).toBeNull();
  });
});

describe('formatMonthDay', () => {
  it('formats valid MM-dd to readable string', () => {
    expect(formatMonthDay('09-01')).toBe('Sep 1');
    expect(formatMonthDay('12-25')).toBe('Dec 25');
  });

  it('returns empty string for invalid input', () => {
    expect(formatMonthDay(null)).toBe('');
    expect(formatMonthDay(undefined)).toBe('');
    expect(formatMonthDay('')).toBe('');
  });
});

describe('toMonthDayString', () => {
  it('formats month and day with zero-padding', () => {
    expect(toMonthDayString(9, 1)).toBe('09-01');
    expect(toMonthDayString(12, 31)).toBe('12-31');
  });

  it('handles single-digit values', () => {
    expect(toMonthDayString(1, 5)).toBe('01-05');
  });
});

describe('isWrappingRange', () => {
  it('returns true for ranges that wrap around year end', () => {
    expect(isWrappingRange('11-01', '02-28')).toBe(true);
    expect(isWrappingRange('12-01', '01-31')).toBe(true);
  });

  it('returns false for normal ranges', () => {
    expect(isWrappingRange('03-01', '06-30')).toBe(false);
    expect(isWrappingRange('01-01', '12-31')).toBe(false);
  });

  it('returns false when either value is null', () => {
    expect(isWrappingRange(null, '06-30')).toBe(false);
    expect(isWrappingRange('03-01', null)).toBe(false);
  });

  it('returns false when both values are null', () => {
    expect(isWrappingRange(null, null)).toBe(false);
  });
});

describe('hasSeasonalAvailability', () => {
  it('returns true when from is set', () => {
    expect(hasSeasonalAvailability('09-01', null)).toBe(true);
  });

  it('returns true when to is set', () => {
    expect(hasSeasonalAvailability(null, '11-30')).toBe(true);
  });

  it('returns true when both are set', () => {
    expect(hasSeasonalAvailability('09-01', '11-30')).toBe(true);
  });

  it('returns false when neither is set', () => {
    expect(hasSeasonalAvailability(null, null)).toBe(false);
    expect(hasSeasonalAvailability(undefined, undefined)).toBe(false);
    expect(hasSeasonalAvailability('', '')).toBe(false);
  });
});

describe('daysInMonth', () => {
  const JAN_DAYS = 31;
  const FEB_DAYS = 28;
  const APR_DAYS = 30;
  const DEFAULT_DAYS = 31;

  it('returns correct days for each month', () => {
    expect(daysInMonth(1)).toBe(JAN_DAYS);
    expect(daysInMonth(2)).toBe(FEB_DAYS);
    expect(daysInMonth(4)).toBe(APR_DAYS);
  });

  it('returns 31 for out-of-range month', () => {
    expect(daysInMonth(0)).toBe(DEFAULT_DAYS);
    expect(daysInMonth(13)).toBe(DEFAULT_DAYS);
  });
});

describe('getMonthOptions', () => {
  it('returns 12 month options', () => {
    const TOTAL_MONTHS = 12;
    const options = getMonthOptions();
    expect(options).toHaveLength(TOTAL_MONTHS);
  });

  it('first option is January with value 1', () => {
    const options = getMonthOptions();
    expect(options[0]).toEqual({ value: 1, label: 'Jan' });
  });

  it('last option is December with value 12', () => {
    const DECEMBER_INDEX = 11;
    const DECEMBER_VALUE = 12;
    const options = getMonthOptions();
    expect(options[DECEMBER_INDEX]).toEqual({ value: DECEMBER_VALUE, label: 'Dec' });
  });
});

describe('getDayOptions', () => {
  it('returns 31 options for January', () => {
    const JAN_DAYS = 31;
    const options = getDayOptions(1);
    expect(options).toHaveLength(JAN_DAYS);
  });

  it('returns 28 options for February', () => {
    const FEB_DAYS = 28;
    const options = getDayOptions(2);
    expect(options).toHaveLength(FEB_DAYS);
  });

  it('returns 30 options for April', () => {
    const APR_DAYS = 30;
    const options = getDayOptions(4);
    expect(options).toHaveLength(APR_DAYS);
  });

  it('options have correct value and label', () => {
    const options = getDayOptions(1);
    expect(options[0]).toEqual({ value: 1, label: '1' });
    expect(options[4]).toEqual({ value: 5, label: '5' });
  });
});
