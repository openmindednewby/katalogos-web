/**
 * Tests for usePopularItems hook.
 * Focuses on query key generation logic.
 */
import { getPopularItemsQueryKey } from './usePopularItems';

const SAMPLE_FROM = '2026-03-01';
const SAMPLE_TO = '2026-03-21';

describe('getPopularItemsQueryKey', () => {
  it('returns a query key containing endpoint, from, and to', () => {
    const key = getPopularItemsQueryKey(SAMPLE_FROM, SAMPLE_TO);
    expect(key).toEqual([
      '/api/analytics/popular-items',
      SAMPLE_FROM,
      SAMPLE_TO,
    ]);
  });

  it('returns a new array reference on each call', () => {
    const keyA = getPopularItemsQueryKey(SAMPLE_FROM, SAMPLE_TO);
    const keyB = getPopularItemsQueryKey(SAMPLE_FROM, SAMPLE_TO);
    expect(keyA).toEqual(keyB);
    expect(keyA).not.toBe(keyB);
  });

  it('produces different keys for different date ranges', () => {
    const keyA = getPopularItemsQueryKey('2026-03-01', '2026-03-07');
    const keyB = getPopularItemsQueryKey('2026-03-01', '2026-03-21');
    expect(keyA).not.toEqual(keyB);
  });
});
