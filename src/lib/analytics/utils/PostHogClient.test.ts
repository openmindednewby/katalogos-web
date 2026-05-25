import posthog from 'posthog-js';

import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import { REDACTED_VALUE } from '../constants';
import { PostHogClient } from './PostHogClient';

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: {
    init: jest.fn(),
    capture: jest.fn(),
    identify: jest.fn(),
    reset: jest.fn(),
    getFeatureFlag: jest.fn(),
  },
}));

const mockPosthog = posthog as jest.Mocked<typeof posthog>;

describe('PostHogClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls posthog.init with correct config on construction', () => {
    new PostHogClient('phc_test_key', 'https://app.posthog.com');

    expect(mockPosthog.init).toHaveBeenCalledWith('phc_test_key', {
      api_host: 'https://app.posthog.com',
      capture_pageview: false,
      capture_pageleave: true,
      persistence: 'localStorage',
    });
  });

  it('track calls posthog.capture with event name and sanitized properties', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');

    client.track(AnalyticsEventName.MenuCreated, { menuType: 'cafe' });

    expect(mockPosthog.capture).toHaveBeenCalledWith(
      AnalyticsEventName.MenuCreated,
      { menuType: 'cafe' },
    );
  });

  it('track calls posthog.capture with undefined when no properties given', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');

    client.track(AnalyticsEventName.PageViewed);

    expect(mockPosthog.capture).toHaveBeenCalledWith(
      AnalyticsEventName.PageViewed,
      undefined,
    );
  });

  it('track redacts sensitive properties before sending', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');

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

  it('identify calls posthog.identify with distinctId and sanitized traits', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');

    client.identify('user-123', { tenantId: 't-1' });

    expect(mockPosthog.identify).toHaveBeenCalledWith('user-123', { tenantId: 't-1' });
  });

  it('identify redacts sensitive traits', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');

    client.identify('user-123', { email: 'user@test.com', role: 'admin' });

    expect(mockPosthog.identify).toHaveBeenCalledWith('user-123', {
      email: REDACTED_VALUE,
      role: 'admin',
    });
  });

  it('identify calls posthog.identify with undefined when no traits given', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');

    client.identify('user-123');

    expect(mockPosthog.identify).toHaveBeenCalledWith('user-123', undefined);
  });

  it('page calls posthog.capture with $pageview event and path', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');

    client.page('/menus');

    expect(mockPosthog.capture).toHaveBeenCalledWith('$pageview', { $current_url: '/menus' });
  });

  it('reset calls posthog.reset', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');

    client.reset();

    expect(mockPosthog.reset).toHaveBeenCalled();
  });

  it('getFeatureFlag delegates to posthog.getFeatureFlag', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    (mockPosthog.getFeatureFlag as jest.Mock).mockReturnValue(true);

    const result = client.getFeatureFlag('beta-feature');

    expect(mockPosthog.getFeatureFlag).toHaveBeenCalledWith('beta-feature');
    expect(result).toBe(true);
  });

  it('getFeatureFlag returns string variant for multivariate flags', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    (mockPosthog.getFeatureFlag as jest.Mock).mockReturnValue('variant-a');

    const result = client.getFeatureFlag('button-color');

    expect(result).toBe('variant-a');
  });

  it('getFeatureFlag returns undefined when posthog returns undefined', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    (mockPosthog.getFeatureFlag as jest.Mock).mockReturnValue(undefined);

    const result = client.getFeatureFlag('unknown-flag');

    expect(result).toBeUndefined();
  });

  it('getFeatureFlag returns undefined when posthog returns null', () => {
    const client = new PostHogClient('phc_key', 'https://ph.example.com');
    (mockPosthog.getFeatureFlag as jest.Mock).mockReturnValue(null);

    const result = client.getFeatureFlag('unknown-flag');

    expect(result).toBeUndefined();
  });
});
