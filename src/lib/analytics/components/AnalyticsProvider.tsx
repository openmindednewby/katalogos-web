import type { ReactElement, ReactNode } from 'react';
import { createContext, useMemo } from 'react';

import { useCookieConsent } from '../../../components/CookieConsent/hooks/useCookieConsent';
import env from '../../../config/environment';
import { featureFlags } from '../../../config/featureFlags';
import { loggingService } from '../../logging';
import { DevClient } from '../utils/DevClient';
import { MultiProviderClient } from '../utils/MultiProviderClient';
import { NoOpClient } from '../utils/NoOpClient';
import { PostHogClient } from '../utils/PostHogClient';
import { UmamiClient } from '../utils/UmamiClient';

import type { AnalyticsClient } from '../types';

const noOpClient = new NoOpClient();

/** React context exposing the active analytics client. */
export const AnalyticsContext = createContext<AnalyticsClient>(noOpClient);

function isDntEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  return navigator.doNotTrack === '1';
}

function isDev(): boolean {
  return typeof __DEV__ === 'boolean' ? __DEV__ : false;
}

function buildClient(analyticsConsent: boolean): AnalyticsClient {
  const providers: AnalyticsClient[] = [];

  if (isDev())
    providers.push(new DevClient(loggingService));

  const shouldSkipRealProviders = !analyticsConsent || isDntEnabled();
  if (shouldSkipRealProviders || !featureFlags.analyticsEnabled)
    return providers.length > 0 ? new MultiProviderClient(providers, loggingService) : noOpClient;

  const umamiUrl = env.ANALYTICS_UMAMI_URL;
  const umamiWebsiteId = env.ANALYTICS_UMAMI_WEBSITE_ID;
  const isUmamiConfigured = umamiUrl !== '' && umamiWebsiteId !== '';
  if (isUmamiConfigured)
    providers.push(new UmamiClient(umamiUrl, umamiWebsiteId, loggingService));

  const postHogKey = env.ANALYTICS_POSTHOG_KEY;
  const postHogHost = env.ANALYTICS_POSTHOG_HOST;
  const isPostHogConfigured = env.ANALYTICS_POSTHOG_ENABLED && postHogKey !== '' && postHogHost !== '';
  if (isPostHogConfigured)
    providers.push(new PostHogClient(postHogKey, postHogHost));

  if (providers.length === 0) return noOpClient;
  return new MultiProviderClient(providers, loggingService);
}

interface AnalyticsProviderProps {
  children: ReactNode;
}

/** Provides the analytics client to the component tree, gated on consent. */
export const AnalyticsProvider = ({ children }: AnalyticsProviderProps): ReactElement => {
  const { consent } = useCookieConsent();
  const analyticsConsent = consent?.analytics === true;

  const client = useMemo(() => buildClient(analyticsConsent), [analyticsConsent]);

  return <AnalyticsContext.Provider value={client}>{children}</AnalyticsContext.Provider>;
};
