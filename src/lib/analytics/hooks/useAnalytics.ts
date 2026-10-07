import { useContext, useCallback } from 'react';

import { AnalyticsContext } from '../components/AnalyticsProvider';

import type AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import type { EventProperties } from '../types';

interface UseAnalyticsReturn {
  track: (event: AnalyticsEventName, properties?: EventProperties) => void;
  identify: (distinctId: string, traits?: EventProperties) => void;
  page: (path: string, properties?: EventProperties) => void;
  reset: () => void;
}

/** Primary analytics hook. All event tracking goes through this. */
export function useAnalytics(): UseAnalyticsReturn {
  const client = useContext(AnalyticsContext);

  const track = useCallback(
    (event: AnalyticsEventName, properties?: EventProperties) => {
      client.track(event, properties);
    },
    [client],
  );

  const identify = useCallback(
    (distinctId: string, traits?: EventProperties) => {
      client.identify(distinctId, traits);
    },
    [client],
  );

  const page = useCallback(
    (path: string, properties?: EventProperties) => {
      client.page(path, properties);
    },
    [client],
  );

  const reset = useCallback(() => {
    client.reset();
  }, [client]);

  return { track, identify, page, reset };
}
