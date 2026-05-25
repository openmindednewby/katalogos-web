import PopularityTier from '@/shared/enums/PopularityTier';
import TimePeriod from '@/shared/enums/TimePeriod';

import { computeClickThroughRate, getPopularityTier, getDateRangeForPeriod, getTopItems } from './popularityUtils';

import type { PopularItemEntry } from '../types';

describe('computeClickThroughRate', () => {
  it('returns 0 when viewCount is 0', () => {
    expect(computeClickThroughRate(0, 5)).toBe(0);
  });

  it('calculates correct percentage', () => {
    expect(computeClickThroughRate(100, 25)).toBe(25);
  });

  it('rounds to nearest integer', () => {
    expect(computeClickThroughRate(3, 1)).toBe(33);
  });

  it('returns 100 when all views are clicked', () => {
    expect(computeClickThroughRate(10, 10)).toBe(100);
  });
});

describe('getPopularityTier', () => {
  it('returns Hot for 50+ views', () => {
    expect(getPopularityTier(50)).toBe(PopularityTier.Hot);
    expect(getPopularityTier(100)).toBe(PopularityTier.Hot);
  });

  it('returns Popular for 20-49 views', () => {
    expect(getPopularityTier(20)).toBe(PopularityTier.Popular);
    expect(getPopularityTier(49)).toBe(PopularityTier.Popular);
  });

  it('returns Normal for fewer than 20 views', () => {
    expect(getPopularityTier(0)).toBe(PopularityTier.Normal);
    expect(getPopularityTier(19)).toBe(PopularityTier.Normal);
  });
});

describe('getDateRangeForPeriod', () => {
  it('returns same date for from and to when period is Today', () => {
    const result = getDateRangeForPeriod(TimePeriod.Today);
    expect(result.from).toBe(result.to);
  });

  it('returns a 7-day range for SevenDays', () => {
    const result = getDateRangeForPeriod(TimePeriod.SevenDays);
    const fromDate = new Date(result.from);
    const toDate = new Date(result.to);
    const diffMs = toDate.getTime() - fromDate.getTime();
    const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
    expect(diffMs).toBe(SEVEN_DAYS_MS);
  });

  it('returns a 30-day range for ThirtyDays', () => {
    const result = getDateRangeForPeriod(TimePeriod.ThirtyDays);
    const fromDate = new Date(result.from);
    const toDate = new Date(result.to);
    const diffMs = toDate.getTime() - fromDate.getTime();
    const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
    expect(diffMs).toBe(THIRTY_DAYS_MS);
  });
});

describe('getTopItems', () => {
  const items: PopularItemEntry[] = [
    { itemId: '1', itemName: 'A', categoryName: 'Cat1', viewCount: 10, clickCount: 2 },
    { itemId: '2', itemName: 'B', categoryName: 'Cat1', viewCount: 50, clickCount: 10 },
    { itemId: '3', itemName: 'C', categoryName: 'Cat2', viewCount: 30, clickCount: 5 },
    { itemId: '4', itemName: 'D', categoryName: 'Cat2', viewCount: 40, clickCount: 8 },
  ];

  it('returns items sorted by viewCount descending', () => {
    const result = getTopItems(items, 4);
    expect(result[0].itemId).toBe('2');
    expect(result[1].itemId).toBe('4');
    expect(result[2].itemId).toBe('3');
    expect(result[3].itemId).toBe('1');
  });

  it('limits to specified count', () => {
    const result = getTopItems(items, 2);
    expect(result).toHaveLength(2);
    expect(result[0].itemId).toBe('2');
    expect(result[1].itemId).toBe('4');
  });

  it('does not mutate the original array', () => {
    const original = [...items];
    getTopItems(items, 2);
    expect(items).toEqual(original);
  });

  it('returns empty array when input is empty', () => {
    expect(getTopItems([], 5)).toEqual([]);
  });
});
