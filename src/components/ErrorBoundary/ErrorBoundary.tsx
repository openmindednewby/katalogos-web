/**
 * Top-level error boundary — a thin binding over the shared `<AppErrorBoundary>` from
 * `@dloizides/ui-feedback` (≥1.7.0), which absorbed the hand-written 224-line class this
 * file used to carry. That class was one of three near-identical copies (kefi-web,
 * erevna-web, katalogos-web), each hardcoding the same eight Bootstrap-4 hex literals;
 * the shared fallback themes from `UiProvider` instead, and announces itself with
 * `role="alert"` + `accessibilityLiveRegion`, which the local copy never did.
 *
 * The chunk-recovery behaviour is preserved EXACTLY, because it encodes a real deploy
 * failure mode: after a deploy the browser can hold a stale `index.html` referencing
 * hashed chunks that now 404. Each axis is injected rather than baked into the kit —
 * the kit never learns what a "chunk" is:
 *
 *  - `recover`     → one guarded reload, then fall through to a manual Reload (never a loop)
 *  - `retryable`   → Try Again is HIDDEN for a chunk error; re-rendering re-hits the same 404
 *  - `labelsFor`   → "Update available" wording instead of "Something went wrong"
 *  - `showDetails` → dev-only, and suppressed for chunk errors (a hashed filename is noise)
 *  - `onMount`     → releases the one-shot guard on a clean mount, so a FUTURE deploy can recover
 *  - `reloadIsPrimary` → Reload gets the filled emphasis; for a stale chunk it is the action
 *                        that actually works
 *
 * MOUNT POINT IS DELIBERATE: `app/_layout.tsx` mounts this ABOVE the theme/UI providers.
 * That means the fallback renders with the kit's neutral defaults rather than Kefi's
 * palette — the intended trade. Moving it below to gain theming would stop it catching
 * throws in the provider-init path, which is exactly the code most likely to throw.
 * `useFeedbackUi()` degrades to a neutral default with no provider above it, so this is
 * safe rather than merely tolerated.
 *
 * `FM` is a module-level i18next call, not a hook, so localizing here works outside providers.
 */
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

/** Pre-localized wording. Resolved per render so a language switch lands. */
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

/** A stale chunk is an UPDATE, not a fault — say so instead of "Something went wrong". */
function chunkAwareLabels(error: Error): Partial<ErrorBoundaryLabels> {
  if (!isChunkLoadError(error)) return {};
  return {
    title: FM('errorBoundary.updateTitle'),
    message: FM('errorBoundary.updateMessage'),
  };
}

export const ErrorBoundary = ({ children, fallback, onError }: Props): React.ReactElement => {
  // The kit calls `onError` and then `recover` synchronously within one componentDidCatch.
  // We stash the ErrorInfo from the first so the second can forward it: the local class
  // called the caller's `onError` ONLY when it was NOT auto-recovering, and that gating is
  // load-bearing for AnalyticsErrorBoundary in the sibling apps — no "error encountered"
  // event for a deploy hiccup the user never saw.
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
      // Stale-chunk after a deploy: one guarded reload before showing any UI.
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
