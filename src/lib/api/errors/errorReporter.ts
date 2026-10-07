
import { logger } from '../../../utils/logger';
import { captureException } from '../../monitoring';

import type { ClassifiedError } from './errorTypes';

/**
 * Report an error to external monitoring (Sentry) and the application log.
 */
function reportToMonitoring(error: ClassifiedError): void {
  logger.error('errorReporter', 'Reported to monitoring', {
    status: error.status,
    url: error.url,
    method: error.method,
    errorCode: error.errorCode,
    message: error.message,
    requestId: error.requestId,
  });

  captureException(error.originalError ?? error, {
    extra: {
      status: error.status,
      url: error.url,
      method: error.method,
      errorCode: error.errorCode,
      requestId: error.requestId,
    },
  });
}

export { reportToMonitoring };
