import PopularityTier from '@/shared/enums/PopularityTier';
import TimePeriod from '@/shared/enums/TimePeriod';

import type { PopularItemEntry } from '../types';

/** Percentage multiplier for CTR calculations. */
const PERCENTAGE_MULTIPLIER = 100;

/** View count threshold above which an item is considered "hot". */
const HOT_THRESHOLD = 50;

/** View count threshold above which an item is considered "popular". */
const POPULAR_THRESHOLD = 20;

/** Computes click-through rate as a percentage. Returns 0 when there are no views. */
export function computeClickThroughRate(viewCount: number, clickCount: number): number {
  if (viewCount === 0) return 0;
  return Math.round((clickCount / viewCount) * PERCENTAGE_MULTIPLIER);
}

/** Determines the popularity tier of an item based on its view count. */
export function getPopularityTier(viewCount: number): PopularityTier {
  if (viewCount >= HOT_THRESHOLD) return PopularityTier.Hot;
  if (viewCount >= POPULAR_THRESHOLD) return PopularityTier.Popular;
  return PopularityTier.Normal;
}

/** Returns ISO date strings for the start and end of a given time period. */
export function getDateRangeForPeriod(period: TimePeriod): { from: string; to: string } {
  const now = new Date();
  const to = now.toISOString().split('T')[0];

  if (period === TimePeriod.Today) return { from: to, to };

  const SEVEN_DAYS = 7;
  const THIRTY_DAYS = 30;
  const daysBack = period === TimePeriod.SevenDays ? SEVEN_DAYS : THIRTY_DAYS;
  const start = new Date(now);
  start.setDate(start.getDate() - daysBack);
  const from = start.toISOString().split('T')[0];

  return { from, to };
}

/** Sorts popular items by view count descending and returns only the top N. */
export function getTopItems(items: PopularItemEntry[], limit: number): PopularItemEntry[] {
  return [...items]
    .sort((a, b) => b.viewCount - a.viewCount)
    .slice(0, limit);
}
