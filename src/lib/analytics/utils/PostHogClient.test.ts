import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import { REDACTED_VALUE } from '../constants';
import { loadPostHog } from './loadPostHog';
import { PostHogClient } from './PostHogClient';

jest.mock('./loadPostHog', () => ({ loadPostHog: jest.fn() }));

const mockPosthog = {
  init: jest.fn(),
  capture: jest.fn(),
  identify: jest.fn(),
  reset: jest.fn(),
  getFeatureFlag: jest.fn(),
};

const mockLoadPostHog = loadPostHog as jest.MockedFunction<typeof loadPostHog>;

describe('PostHogClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLoadPostHog.mockResolvedValue(mockPosthog as unknown as Awaited<ReturnType<typeof loadPostHog>>);
  });

  it('calls posthog.init with correct config on construction', async () => {
    const client = new PostHogClient('phc_test_key', 'https://app.posthog.com');
    await client.ready;

    expect(mockPosthog.init).toHaveBeenCalledWith('phc_test_key', {
      api_host: 'https://app.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      persistence: 'localStorage',
    });
  });

  it('track calls posthog.capture with event name and sanitized properties', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;

    client.track(AnalyticsEventName.MenuCreated, { menuType: 'cafe' });

    expect(mockPosthog.capture).toHaveBeenCalledWith(
      AnalyticsEventName.MenuCreated,
      { menuType: 'cafe' },
    );
  });

  it('track calls posthog.capture with undefined when no properties given', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;

    client.track(AnalyticsEventName.PageViewed);

    expect(mockPosthog.capture).toHaveBeenCalledWith(
      AnalyticsEventName.PageViewed,
      undefined,
    );
  });

  it('queues calls made before the SDK finishes loading and flushes them on ready', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');

    // Called synchronously before the lazy loader resolves.
    client.track(AnalyticsEventName.MenuCreated, { menuType: 'cafe' });
    expect(mockPosthog.capture).not.toHaveBeenCalled();

    await client.ready;

    expect(mockPosthog.capture).toHaveBeenCalledWith(
      AnalyticsEventName.MenuCreated,
      { menuType: 'cafe' },
    );
  });

  it('track redacts sensitive properties before sending', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;

    client.track(AnalyticsEventName.FeatureUsed, {
      feature: 'login',
      password: 'secret123',
      email: 'test@example.com',
    });

    expect(mockPosthog.capture).toHaveBeenCalledWith(
      AnalyticsEventName.FeatureUsed,
      {
        feature: 'login',
        password: REDACTED_VALUE,
        email: REDACTED_VALUE,
      },
    );
  });

  it('identify calls posthog.identify with distinctId and sanitized traits', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;

    client.identify('user-123', { tenantId: 't-1' });

    expect(mockPosthog.identify).toHaveBeenCalledWith('user-123', { tenantId: 't-1' });
  });

  it('identify redacts sensitive traits', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;

    client.identify('user-123', { email: 'user@test.com', role: 'admin' });

    expect(mockPosthog.identify).toHaveBeenCalledWith('user-123', {
      email: REDACTED_VALUE,
      role: 'admin',
    });
  });

  it('identify calls posthog.identify with undefined when no traits given', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;

    client.identify('user-123');

    expect(mockPosthog.identify).toHaveBeenCalledWith('user-123', undefined);
  });

  it('page calls posthog.capture with $pageview event and path', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;

    client.page('/menus');

    expect(mockPosthog.capture).toHaveBeenCalledWith('$pageview', { $current_url: '/menus' });
  });

  it('reset calls posthog.reset', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;

    client.reset();

    expect(mockPosthog.reset).toHaveBeenCalled();
  });

  it('getFeatureFlag delegates to posthog.getFeatureFlag', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;
    mockPosthog.getFeatureFlag.mockReturnValue(true);

    const result = client.getFeatureFlag('beta-feature');

    expect(mockPosthog.getFeatureFlag).toHaveBeenCalledWith('beta-feature');
    expect(result).toBe(true);
  });

  it('getFeatureFlag returns string variant for multivariate flags', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;
    mockPosthog.getFeatureFlag.mockReturnValue('variant-a');

    const result = client.getFeatureFlag('button-color');

    expect(result).toBe('variant-a');
  });

  it('getFeatureFlag returns undefined before the SDK loads', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');

    const result = client.getFeatureFlag('beta-feature');

    expect(result).toBeUndefined();
    expect(mockPosthog.getFeatureFlag).not.toHaveBeenCalled();
  });

  it('getFeatureFlag returns undefined when posthog returns undefined', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;
    mockPosthog.getFeatureFlag.mockReturnValue(undefined);

    const result = client.getFeatureFlag('unknown-flag');

    expect(result).toBeUndefined();
  });

  it('getFeatureFlag returns undefined when posthog returns null', async () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    await client.ready;
    mockPosthog.getFeatureFlag.mockReturnValue(null);

    const result = client.getFeatureFlag('unknown-flag');

    expect(result).toBeUndefined();
  });
});
