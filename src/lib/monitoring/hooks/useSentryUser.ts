/**
 * Hook that synchronises Redux auth state with the Sentry user scope.
 *
 * When the authenticated user changes, `setSentryUser` is called with
 * the Keycloak GUID (no PII). On logout, `clearSentryUser` removes the
 * scope so subsequent events are anonymous.
 */

import { useEffect, useRef } from 'react';

import { useSelector } from 'react-redux';

import { isValueDefined } from '../../../utils/is';
import { clearSentryUser, setSentryUser } from '../utils/sentry';

import type { RootState } from '../../../store/reduxStore';

export function useSentryUser(): void {
  const user = useSelector((s: RootState) => s.auth.user);
  const userInfo = useSelector((s: RootState) => s.auth.userInfo);
  const identifiedIdRef = useRef<string | null>(null);

  useEffect(() => {
    const userId = user?.id;

    if (!isValueDefined(userId) || userId === '') {
      if (isValueDefined(identifiedIdRef.current)) {
        clearSentryUser();
        identifiedIdRef.current = null;
      }
      return;
    }

    if (userId === identifiedIdRef.current) return;

    identifiedIdRef.current = userId;
    const tenantId = userInfo?.tenantId;
    setSentryUser(userId, tenantId);
  }, [user?.id, userInfo?.tenantId]);
}
