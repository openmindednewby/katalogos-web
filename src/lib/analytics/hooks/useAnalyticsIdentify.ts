import { useEffect, useRef } from 'react';

import { useSelector } from 'react-redux';

import { useAnalytics } from './useAnalytics';
import { isValueDefined } from '../../../utils/is';

import type { RootState } from '../../../store/reduxStore';

/**
 * Automatically identifies or resets the analytics user when auth state changes.
 * Uses only the Keycloak GUID — no PII (no email, name, or phone).
 */
export function useAnalyticsIdentify(): void {
  const user = useSelector((s: RootState) => s.auth.user);
  const userInfo = useSelector((s: RootState) => s.auth.userInfo);
  const { identify, reset } = useAnalytics();
  const identifiedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?.id;

    if (!isValueDefined(userId) || userId === '') {
      if (isValueDefined(identifiedIdRef.current)) {
        reset();
        identifiedIdRef.current = null;
      }
      return;
    }

    if (userId === identifiedIdRef.current) return;

    identifiedIdRef.current = userId;
    const tenantId = userInfo?.tenantId;
    identify(userId, {
      ...(isValueDefined(tenantId) && tenantId !== '' ? { tenantId } : {}),
    });
  }, [user?.id, userInfo?.tenantId, identify, reset]);
}
