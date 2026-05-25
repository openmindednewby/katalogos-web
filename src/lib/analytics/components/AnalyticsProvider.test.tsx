import React, { useContext } from 'react';

import { renderHook } from '@testing-library/react-native';

import { AnalyticsContext, AnalyticsProvider } from './AnalyticsProvider';
import { MultiProviderClient } from '../utils/MultiProviderClient';
import { NoOpClient } from '../utils/NoOpClient';

import type { AnalyticsClient } from '../types';

jest.mock('posthog-js', () => ({
  __esModule: true,
  default: { init: jest.fn(), capture: jest.fn(), identify: jest.fn(), reset: jest.fn() },
}));
jest.mock('../../../components/CookieConsent/hooks/useCookieConsent');
jest.mock('../../../config/featureFlags', () => ({
  featureFlags: { analyticsEnabled: true },
}));
jest.mock('../../../config/environment', () => ({
  __esModule: true,
  default: {
    ANALYTICS_UMAMI_URL: '',
    ANALYTICS_UMAMI_WEBSITE_ID: '',
    ANALYTICS_POSTHOG_KEY: '',
    ANALYTICS_POSTHOG_HOST: '',
    ANALYTICS_POSTHOG_ENABLED: false,
  },
}));

const mockUseCookieConsent =
  jest.requireMock('../../../components/CookieConsent/hooks/useCookieConsent').useCookieConsent as jest.Mock;
const mockEnv = jest.requireMock('../../../config/environment').default as Record<string, unknown>;
const mockFeatureFlags = jest.requireMock('../../../config/featureFlags').featureFlags as Record<string, boolean>;

function getClient(): AnalyticsClient {
  const wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement => (
    <AnalyticsProvider>{children}</AnalyticsProvider>
  );
  const { result } = renderHook(() => useContext(AnalyticsContext), { wrapper });
  return result.current;
}

describe('AnalyticsProvider', () => {
  beforeEach(() => {
    mockUseCookieConsent.mockReturnValue({ consent: { analytics: true } });
    mockEnv.ANALYTICS_UMAMI_URL = '';
    mockEnv.ANALYTICS_UMAMI_WEBSITE_ID = '';
    mockEnv.ANALYTICS_POSTHOG_KEY = '';
    mockEnv.ANALYTICS_POSTHOG_HOST = '';
    mockEnv.ANALYTICS_POSTHOG_ENABLED = false;
    mockFeatureFlags.analyticsEnabled = true;
    Object.defineProperty(globalThis, '__DEV__', { value: false, writable: true });
    Object.defineProperty(globalThis.navigator, 'doNotTrack', { value: '0', configurable: true });
  });

  it('returns NoOpClient when consent is denied', () => {
    mockUseCookieConsent.mockReturnValue({ consent: { analytics: false } });

    const client = getClient();

    expect(client).toBeInstanceOf(NoOpClient);
  });

  it('returns NoOpClient when feature flag is disabled', () => {
    mockFeatureFlags.analyticsEnabled = false;

    const client = getClient();

    expect(client).toBeInstanceOf(NoOpClient);
  });

  it('returns NoOpClient when DNT is enabled', () => {
    Object.defineProperty(globalThis.navigator, 'doNotTrack', { value: '1', configurable: true });

    const client = getClient();

    expect(client).toBeInstanceOf(NoOpClient);
  });

  it('returns MultiProviderClient with DevClient in dev mode', () => {
    Object.defineProperty(globalThis, '__DEV__', { value: true, writable: true });

    const client = getClient();

    expect(client).toBeInstanceOf(MultiProviderClient);
  });

  it('returns MultiProviderClient when Umami is configured', () => {
    mockEnv.ANALYTICS_UMAMI_URL = 'http://umami:3000';
    mockEnv.ANALYTICS_UMAMI_WEBSITE_ID = 'site-1';

    const client = getClient();

    expect(client).toBeInstanceOf(MultiProviderClient);
  });

  it('returns MultiProviderClient with DevClient when consent denied in dev', () => {
    Object.defineProperty(globalThis, '__DEV__', { value: true, writable: true });
    mockUseCookieConsent.mockReturnValue({ consent: { analytics: false } });

    const client = getClient();

    expect(client).toBeInstanceOf(MultiProviderClient);
  });

  it('returns MultiProviderClient when PostHog is configured', () => {
    mockEnv.ANALYTICS_POSTHOG_KEY = 'phc_test_key';
    mockEnv.ANALYTICS_POSTHOG_HOST = 'https://app.posthog.com';
    mockEnv.ANALYTICS_POSTHOG_ENABLED = true;

    const client = getClient();

    expect(client).toBeInstanceOf(MultiProviderClient);
  });

  it('returns NoOpClient when PostHog is disabled even with key and host', () => {
    mockEnv.ANALYTICS_POSTHOG_KEY = 'phc_test_key';
    mockEnv.ANALYTICS_POSTHOG_HOST = 'https://app.posthog.com';
    mockEnv.ANALYTICS_POSTHOG_ENABLED = false;

    const client = getClient();

    expect(client).toBeInstanceOf(NoOpClient);
  });

  it('returns NoOpClient when no providers configured and consent granted', () => {
    const client = getClient();

    expect(client).toBeInstanceOf(NoOpClient);
  });
});
