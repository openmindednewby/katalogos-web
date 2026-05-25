/**
 * Tests for useMenuAnalytics hook.
 * Focuses on query key generation logic.
 */
import { getMenuAnalyticsQueryKey } from './useMenuAnalytics';

const SAMPLE_MENU_ID = 'menu-123';
const SAMPLE_FROM = '2026-01-01';
const SAMPLE_TO = '2026-01-31';

describe('getMenuAnalyticsQueryKey', () => {
  it('returns a query key containing endpoint, menuId, from, and to', () => {
    const key = getMenuAnalyticsQueryKey(SAMPLE_MENU_ID, SAMPLE_FROM, SAMPLE_TO);
    expect(key).toEqual([
      '/api/analytics/menu',
      SAMPLE_MENU_ID,
      SAMPLE_FROM,
      SAMPLE_TO,
    ]);
  });

  it('returns a new array reference on each call', () => {
    const keyA = getMenuAnalyticsQueryKey(SAMPLE_MENU_ID, SAMPLE_FROM, SAMPLE_TO);
    const keyB = getMenuAnalyticsQueryKey(SAMPLE_MENU_ID, SAMPLE_FROM, SAMPLE_TO);
    expect(keyA).toEqual(keyB);
    expect(keyA).not.toBe(keyB);
  });

  it('produces different keys for different menu IDs', () => {
    const keyA = getMenuAnalyticsQueryKey('menu-a', SAMPLE_FROM, SAMPLE_TO);
    const keyB = getMenuAnalyticsQueryKey('menu-b', SAMPLE_FROM, SAMPLE_TO);
    expect(keyA).not.toEqual(keyB);
  });

  it('produces different keys for different date ranges', () => {
    const keyA = getMenuAnalyticsQueryKey(SAMPLE_MENU_ID, '2026-01-01', '2026-01-07');
    const keyB = getMenuAnalyticsQueryKey(SAMPLE_MENU_ID, '2026-01-01', '2026-01-31');
    expect(keyA).not.toEqual(keyB);
  });
});
