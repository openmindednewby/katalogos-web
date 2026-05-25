import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import { REDACTED_VALUE } from '../constants';
import { UmamiClient } from './UmamiClient';

import type { LoggingService } from '../../logging';

function createMockLogger(): jest.Mocked<LoggingService> {
  return { warn: jest.fn() } as unknown as jest.Mocked<LoggingService>;
}

describe('UmamiClient', () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    globalThis.fetch = jest.fn().mockResolvedValue({ ok: true });
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it('sends event to Umami API', () => {
    const client = new UmamiClient('http://umami:3000', 'site-1', createMockLogger());

    client.track(AnalyticsEventName.MenuCreated, { menuType: 'cafe' });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://umami:3000/api/send',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }),
    );

    const body = JSON.parse((globalThis.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.type).toBe('event');
    expect(body.payload.website).toBe('site-1');
    expect(body.payload.name).toBe(AnalyticsEventName.MenuCreated);
    expect(body.payload.data).toEqual({ menuType: 'cafe' });
  });

  it('sends page view with url', () => {
    const client = new UmamiClient('http://umami:3000', 'site-1', createMockLogger());

    client.page('/menus');

    const body = JSON.parse((globalThis.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.payload.url).toBe('/menus');
  });

  it('redacts sensitive properties', () => {
    const client = new UmamiClient('http://umami:3000', 'site-1', createMockLogger());

    client.track(AnalyticsEventName.FeatureUsed, {
      feature: 'login',
      password: 'secret123',
      email: 'test@example.com',
    });

    const body = JSON.parse((globalThis.fetch as jest.Mock).mock.calls[0][1].body);
    expect(body.payload.data.feature).toBe('login');
    expect(body.payload.data.password).toBe(REDACTED_VALUE);
    expect(body.payload.data.email).toBe(REDACTED_VALUE);
  });

  it('identify is a no-op for Umami', () => {
    const client = new UmamiClient('http://umami:3000', 'site-1', createMockLogger());

    client.identify('user-1');

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('reset is a no-op for Umami', () => {
    const client = new UmamiClient('http://umami:3000', 'site-1', createMockLogger());

    client.reset();

    expect(globalThis.fetch).not.toHaveBeenCalled();
  });

  it('logs warning on fetch failure without throwing', async () => {
    const logger = createMockLogger();
    globalThis.fetch = jest.fn().mockRejectedValue(new Error('network error'));
    const client = new UmamiClient('http://umami:3000', 'site-1', logger);

    client.track(AnalyticsEventName.PageViewed);

    await Promise.resolve();

    expect(logger.warn).toHaveBeenCalled();
  });
});
