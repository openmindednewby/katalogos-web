import React, { useCallback } from 'react';
import type { ErrorInfo, ReactNode } from 'react';

import { ErrorBoundary } from './ErrorBoundary';
import { useAnalytics } from '../../lib/analytics';
import AnalyticsEventName from '../../shared/enums/AnalyticsEventName';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

/** Wraps ErrorBoundary to fire an analytics event when an error is caught. */
const AnalyticsErrorBoundary = ({ children, fallback }: Props): React.ReactElement => {
  const { track } = useAnalytics();

  const handleError = useCallback(
    (error: Error, _errorInfo: ErrorInfo) => {
      track(AnalyticsEventName.ErrorEncountered, { errorType: error.name });
    },
    [track],
  );

  return (
    <ErrorBoundary fallback={fallback} onError={handleError}>
      {children}
    </ErrorBoundary>
  );
};

export default AnalyticsErrorBoundary;
