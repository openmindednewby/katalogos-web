import { checkServiceHealth, HEALTH_QUERY_KEY, POLL_INTERVAL_MS, REQUEST_TIMEOUT_MS } from './useServiceHealth';
import ServiceHealthStatus from '../../../shared/enums/ServiceHealthStatus';

describe('checkServiceHealth', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('returns Healthy for a fast 200 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });

    const result = await checkServiceHealth('http://localhost:5002', 'identity');

    expect(result.serviceKey).toBe('identity');
    expect(result.status).toBe(ServiceHealthStatus.Healthy);
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
    expect(result.lastCheckedAt).toBeTruthy();
  });

  it('returns Down for a 500 response', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 500 });

    const result = await checkServiceHealth('http://localhost:5002', 'identity');

    expect(result.status).toBe(ServiceHealthStatus.Down);
    expect(result.responseTimeMs).toBeGreaterThanOrEqual(0);
  });

  it('returns Down when fetch throws (network error)', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const result = await checkServiceHealth('http://localhost:5002', 'identity');

    expect(result.status).toBe(ServiceHealthStatus.Down);
    expect(result.responseTimeMs).toBeNull();
  });

  it('includes the correct lastCheckedAt ISO timestamp', async () => {
    global.fetch = jest.fn().mockResolvedValue({ status: 200 });

    const before = new Date().toISOString();
    const result = await checkServiceHealth('http://localhost:5002', 'identity');
    const after = new Date().toISOString();

    expect(result.lastCheckedAt >= before).toBe(true);
    expect(result.lastCheckedAt <= after).toBe(true);
  });
});

describe('constants', () => {
  it('POLL_INTERVAL_MS is 30 seconds', () => {
    const THIRTY_SECONDS = 30_000;
    expect(POLL_INTERVAL_MS).toBe(THIRTY_SECONDS);
  });

  it('HEALTH_QUERY_KEY is a readonly tuple', () => {
    expect(HEALTH_QUERY_KEY).toEqual(['service-health']);
  });

  it('REQUEST_TIMEOUT_MS is 5 seconds', () => {
    const FIVE_SECONDS = 5000;
    expect(REQUEST_TIMEOUT_MS).toBe(FIVE_SECONDS);
  });
});
