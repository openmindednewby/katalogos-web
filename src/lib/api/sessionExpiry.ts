/**
 * Session-expiry interceptor — BFF era.
 *
 * Before the Phase 2 cutover, a 401 triggered a client-side token refresh.
 * The BFF now refreshes the access token **server-side** (silent
 * `grant_type=refresh_token` against Keycloak, guarded by a Redis `SETNX`
 * lock). A 401 reaching the SPA *can* mean the session is over — the refresh
 * token is gone or revoked.
 *
 * But a 401 on a `/bff/api/*` call is NOT, on its own, proof of a dead
 * session. Downstream services return 401 for endpoint-level authorization
 * reasons too: e.g. `tenant-api`'s `/me/business-profile` answers 401 when the
 * tenant has no business profile configured yet. Treating *every* 401 as
 * session death tore down a perfectly valid session whenever a non-critical
 * call (such as the fire-and-forget dashboard prefetch) hit such an endpoint,
 * bouncing the user straight back to the login form.
 *
 * The authoritative signal for a dead BFF session is `GET /bff/me`: it reads
 * the session cookie and the Redis token vault directly. So on a 401 this
 * interceptor first confirms with `/bff/me` — only when that *also* fails is
 * the session genuinely over, and only then does it clear the client session
 * view and emit `session-expired`. An endpoint-level 401 propagates as an
 * ordinary error for the caller to handle. There is no retry, no refresh, no
 * token handling — the SPA holds no token.
 */

import { apiEventBus } from './events/apiEventBus';
import { bffAuthClient } from '../../auth/bffClient';
import { HTTP_STATUS } from '../../shared/constants';
import { reduxStore } from '../../store/reduxStore';
import { clearSession } from '../../store/slices/authSlice';
import { isValueDefined } from '../../utils/is';
import { logger } from '../../utils/logger';

import type { AxiosError, AxiosInstance } from 'axios';

const LOG_CONTEXT = 'sessionExpiry';

function emitSessionExpired(): void {
  apiEventBus.emit({ type: 'session-expired' });
}

function clearClientSession(): void {
  try {
    reduxStore.dispatch(clearSession());
  } catch (err) {
    logger.error(LOG_CONTEXT, 'Failed to clear session state', err);
  }
}

/**
 * Confirms whether the BFF session is genuinely dead by probing `/bff/me`.
 * Returns `true` only when `/bff/me` reports no live session (its result is
 * `null`) or the probe itself fails — i.e. the session is really over. A
 * successful `/bff/me` means the 401 was endpoint-level, not session death.
 */
async function isBffSessionDead(): Promise<boolean> {
  try {
    const user = await bffAuthClient.getCurrentUser();
    return !isValueDefined(user);
  } catch (err) {
    logger.warn(LOG_CONTEXT, 'Session probe (/bff/me) failed — treating session as ended', err);
    return true;
  }
}

/**
 * Registers a response error interceptor that treats a 401 as a *candidate*
 * for a terminated BFF session: it confirms with `/bff/me` and only clears the
 * session view + emits `session-expired` when the session is genuinely dead.
 */
function registerSessionExpiryInterceptor(axiosInstance: AxiosInstance): number {
  return axiosInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      if (status === HTTP_STATUS.UNAUTHORIZED && (await isBffSessionDead())) {
        logger.warn(LOG_CONTEXT, 'BFF session confirmed ended via /bff/me');
        clearClientSession();
        emitSessionExpired();
      }
      return Promise.reject(isValueDefined(error) ? error : new Error('request failed'));
    },
  );
}

export { registerSessionExpiryInterceptor };
