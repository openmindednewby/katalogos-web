/**
 * Unit tests for useOperatingHours hook logic.
 * Tests parse, serialize, toggle, and time update operations.
 */

import { DEFAULT_CLOSE_TIME, DEFAULT_OPEN_TIME } from '../constants';
import { createDefaultHours, parseOperatingHours, serializeOperatingHours } from './useOperatingHours';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const EXPECTED_DAYS_COUNT = 7;
const MONDAY_INDEX = 0;
const SUNDAY_INDEX = 6;
const FRIDAY_INDEX = 4;

const VALID_JSON = JSON.stringify({
  hours: [
    { day: 0, open: '08:00', close: '20:00', isClosed: false },
    { day: 1, open: '08:00', close: '20:00', isClosed: false },
    { day: 2, open: '08:00', close: '20:00', isClosed: false },
    { day: 3, open: '08:00', close: '20:00', isClosed: false },
    { day: 4, open: '08:00', close: '23:00', isClosed: false },
    { day: 5, open: '10:00', close: '23:00', isClosed: false },
    { day: 6, open: '', close: '', isClosed: true },
  ],
});

// ---------------------------------------------------------------------------
// Tests: createDefaultHours
// ---------------------------------------------------------------------------

describe('createDefaultHours', () => {
  it('creates entries for all 7 days', () => {
    const hours = createDefaultHours();
    expect(hours).toHaveLength(EXPECTED_DAYS_COUNT);
  });

  it('assigns sequential day values 0 through 6', () => {
    const hours = createDefaultHours();
    const days = hours.map(h => h.day);
    expect(days).toEqual([0, 1, 2, 3, 4, 5, 6]);
  });

  it('sets default open time for all days', () => {
    const hours = createDefaultHours();
    expect(hours.every(h => h.open === DEFAULT_OPEN_TIME)).toBe(true);
  });

  it('sets default close time for all days', () => {
    const hours = createDefaultHours();
    expect(hours.every(h => h.close === DEFAULT_CLOSE_TIME)).toBe(true);
  });

  it('sets all days as not closed by default', () => {
    const hours = createDefaultHours();
    expect(hours.every(h => !h.isClosed)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tests: parseOperatingHours
// ---------------------------------------------------------------------------

describe('parseOperatingHours', () => {
  it('returns defaults for null input', () => {
    const hours = parseOperatingHours(null);
    expect(hours).toHaveLength(EXPECTED_DAYS_COUNT);
    expect(hours[MONDAY_INDEX].open).toBe(DEFAULT_OPEN_TIME);
  });

  it('returns defaults for undefined input', () => {
    const hours = parseOperatingHours(undefined);
    expect(hours).toHaveLength(EXPECTED_DAYS_COUNT);
  });

  it('returns defaults for empty string input', () => {
    const hours = parseOperatingHours('');
    expect(hours).toHaveLength(EXPECTED_DAYS_COUNT);
  });

  it('returns defaults for invalid JSON string', () => {
    const hours = parseOperatingHours('not valid json');
    expect(hours).toHaveLength(EXPECTED_DAYS_COUNT);
  });

  it('returns defaults when hours property is missing', () => {
    const hours = parseOperatingHours(JSON.stringify({ timezone: 'UTC' }));
    expect(hours).toHaveLength(EXPECTED_DAYS_COUNT);
  });

  it('returns defaults when hours is not an array', () => {
    const hours = parseOperatingHours(JSON.stringify({ hours: 'not-array' }));
    expect(hours).toHaveLength(EXPECTED_DAYS_COUNT);
  });

  it('parses valid JSON correctly', () => {
    const hours = parseOperatingHours(VALID_JSON);
    expect(hours).toHaveLength(EXPECTED_DAYS_COUNT);
    expect(hours[MONDAY_INDEX].open).toBe('08:00');
    expect(hours[MONDAY_INDEX].close).toBe('20:00');
    expect(hours[MONDAY_INDEX].isClosed).toBe(false);
  });

  it('parses closed day correctly', () => {
    const hours = parseOperatingHours(VALID_JSON);
    expect(hours[SUNDAY_INDEX].isClosed).toBe(true);
  });

  it('preserves different hours per day', () => {
    const hours = parseOperatingHours(VALID_JSON);
    expect(hours[FRIDAY_INDEX].close).toBe('23:00');
  });
});

// ---------------------------------------------------------------------------
// Tests: serializeOperatingHours
// ---------------------------------------------------------------------------

describe('serializeOperatingHours', () => {
  it('wraps hours array in an object with hours key', () => {
    const hours = createDefaultHours();
    const json = serializeOperatingHours(hours);
    const parsed = JSON.parse(json) as { hours: unknown[] };
    expect(parsed.hours).toBeDefined();
    expect(Array.isArray(parsed.hours)).toBe(true);
  });

  it('preserves all day entries', () => {
    const hours = createDefaultHours();
    const json = serializeOperatingHours(hours);
    const parsed = JSON.parse(json) as { hours: unknown[] };
    expect(parsed.hours).toHaveLength(EXPECTED_DAYS_COUNT);
  });

  it('round-trips through parse and serialize', () => {
    const original = parseOperatingHours(VALID_JSON);
    const serialized = serializeOperatingHours(original);
    const roundTripped = parseOperatingHours(serialized);

    expect(roundTripped).toHaveLength(original.length);
    roundTripped.forEach((entry, i) => {
      expect(entry.day).toBe(original[i].day);
      expect(entry.open).toBe(original[i].open);
      expect(entry.close).toBe(original[i].close);
      expect(entry.isClosed).toBe(original[i].isClosed);
    });
  });

  it('produces valid JSON', () => {
    const hours = createDefaultHours();
    const json = serializeOperatingHours(hours);
    expect(() => JSON.parse(json)).not.toThrow();
  });
});

// ---------------------------------------------------------------------------
// Tests: toggle and update operations (pure function simulation)
// ---------------------------------------------------------------------------

describe('operating hours state updates', () => {
  interface HourEntry { day: number; open: string; close: string; isClosed: boolean }

  /**
   * Simulates the toggleClosed logic from the hook.
   */
  function toggleClosed(hours: readonly HourEntry[], day: number): HourEntry[] {
    return hours.map(entry => (entry.day === day ? { ...entry, isClosed: !entry.isClosed } : entry));
  }

  /**
   * Simulates the updateOpenTime logic from the hook.
   */
  function updateOpenTime(hours: readonly HourEntry[], day: number, time: string): HourEntry[] {
    return hours.map(entry => (entry.day === day ? { ...entry, open: time } : entry));
  }

  /**
   * Simulates the updateCloseTime logic from the hook.
   */
  function updateCloseTime(hours: readonly HourEntry[], day: number, time: string): HourEntry[] {
    return hours.map(entry => (entry.day === day ? { ...entry, close: time } : entry));
  }

  it('toggleClosed flips isClosed for the specified day', () => {
    const hours = createDefaultHours();
    const updated = toggleClosed(hours, MONDAY_INDEX);
    expect(updated[MONDAY_INDEX].isClosed).toBe(true);
  });

  it('toggleClosed does not affect other days', () => {
    const hours = createDefaultHours();
    const updated = toggleClosed(hours, MONDAY_INDEX);
    expect(updated[1].isClosed).toBe(false);
    expect(updated[SUNDAY_INDEX].isClosed).toBe(false);
  });

  it('double toggle restores original state', () => {
    const hours = createDefaultHours();
    const toggled = toggleClosed(hours, MONDAY_INDEX);
    const restored = toggleClosed(toggled, MONDAY_INDEX);
    expect(restored[MONDAY_INDEX].isClosed).toBe(false);
  });

  it('updateOpenTime changes open time for specified day', () => {
    const hours = createDefaultHours();
    const updated = updateOpenTime(hours, MONDAY_INDEX, '07:30');
    expect(updated[MONDAY_INDEX].open).toBe('07:30');
  });

  it('updateOpenTime preserves close time', () => {
    const hours = createDefaultHours();
    const updated = updateOpenTime(hours, MONDAY_INDEX, '07:30');
    expect(updated[MONDAY_INDEX].close).toBe(DEFAULT_CLOSE_TIME);
  });

  it('updateCloseTime changes close time for specified day', () => {
    const hours = createDefaultHours();
    const updated = updateCloseTime(hours, FRIDAY_INDEX, '23:30');
    expect(updated[FRIDAY_INDEX].close).toBe('23:30');
  });

  it('updateCloseTime preserves open time', () => {
    const hours = createDefaultHours();
    const updated = updateCloseTime(hours, FRIDAY_INDEX, '23:30');
    expect(updated[FRIDAY_INDEX].open).toBe(DEFAULT_OPEN_TIME);
  });

  it('updateOpenTime does not affect other days', () => {
    const hours = createDefaultHours();
    const updated = updateOpenTime(hours, MONDAY_INDEX, '06:00');
    expect(updated[1].open).toBe(DEFAULT_OPEN_TIME);
  });
});
