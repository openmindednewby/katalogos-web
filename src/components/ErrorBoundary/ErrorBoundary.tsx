import React, { useCallback, useRef } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { AppErrorBoundary, type ErrorBoundaryLabels } from '@dloizides/ui-feedback';
import {
  attemptChunkRecovery,
  clearChunkRecoveryFlag,
  isChunkLoadError,
  reloadPage,
} from '@dloizides/utils';

import { loggingService } from '../../lib/logging';
import { captureException } from '../../lib/monitoring';
import { FM } from '../../localization/helpers';
import { isValueDefined } from '../../utils/is';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

function boundaryLabels(): ErrorBoundaryLabels {
  return {
    title: FM('errorBoundary.title'),
    message: FM('errorBoundary.message'),
    tryAgain: FM('errorBoundary.tryAgain'),
    tryAgainHint: FM('errorBoundary.tryAgainHint'),
    reload: FM('errorBoundary.reload'),
    reloadHint: FM('errorBoundary.reloadHint'),
    updating: FM('errorBoundary.updating'),
    errorDetails: FM('errorBoundary.errorDetails'),
  };
}

function chunkAwareLabels(error: Error): Partial<ErrorBoundaryLabels> {
  if (!isChunkLoadError(error)) return {};
  return {
    title: FM('errorBoundary.updateTitle'),
    message: FM('errorBoundary.updateMessage'),
  };
}

export const ErrorBoundary = ({ children, fallback, onError }: Props): React.ReactElement => {
  const lastErrorInfo = useRef<ErrorInfo | null>(null);

  const report = useCallback((error: Error, errorInfo: ErrorInfo): void => {
    lastErrorInfo.current = errorInfo;
    loggingService.fatal('ErrorBoundary', 'Uncaught React error', error, {
      componentStack: errorInfo.componentStack,
    });
    captureException(error, { extra: { componentStack: errorInfo.componentStack } });
  }, []);

  const recover = useCallback(
    (error: Error): boolean => {
      if (isChunkLoadError(error) && attemptChunkRecovery()) return true;
      if (typeof onError === 'function')
        onError(error, lastErrorInfo.current ?? { componentStack: null });

      return false;
    },
    [onError],
  );

  const renderFallback = useCallback((): ReactNode => fallback, [fallback]);

  return (
    <AppErrorBoundary
      reloadIsPrimary
      fallback={isValueDefined(fallback) ? renderFallback : undefined}
      labels={boundaryLabels()}
      labelsFor={chunkAwareLabels}
      recover={recover}
      retryable={(error): boolean => !isChunkLoadError(error)}
      showDetails={(error): boolean => __DEV__ && !isChunkLoadError(error)}
      onError={report}
      onMount={clearChunkRecoveryFlag}
      onReload={reloadPage}
    >
      {children}
    </AppErrorBoundary>
  );
};

export default ErrorBoundary;
