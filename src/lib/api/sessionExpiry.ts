
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

async function isBffSessionDead(): Promise<boolean> {
  try {
    const user = await bffAuthClient.getCurrentUser();
    return !isValueDefined(user);
  } catch (err) {
    logger.warn(LOG_CONTEXT, 'Session probe (/bff/me) failed — treating session as ended', err);
    return true;
  }
}

/** Registers a response error interceptor that treats a 401 as a *candidate* */
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
