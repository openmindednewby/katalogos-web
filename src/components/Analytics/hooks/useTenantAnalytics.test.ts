/**
 * Tests for useTenantAnalytics hook.
 * Focuses on query key generation and fetch function logic.
 */
import { getTenantAnalyticsQueryKey } from './useTenantAnalytics';

describe('getTenantAnalyticsQueryKey', () => {
  it('returns a stable query key containing the analytics endpoint', () => {
    const key = getTenantAnalyticsQueryKey();
    expect(key).toEqual(['/api/analytics/tenant-summary']);
  });

  it('returns a new array reference on each call (immutability)', () => {
    const keyA = getTenantAnalyticsQueryKey();
    const keyB = getTenantAnalyticsQueryKey();
    expect(keyA).toEqual(keyB);
    expect(keyA).not.toBe(keyB);
  });
});
