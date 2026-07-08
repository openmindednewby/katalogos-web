/**
 * Sentry error monitoring wrapper.
 *
 * All Sentry SDK access is isolated to this module (and its `sentryLoader`
 * seam) so nothing else imports `@sentry/react` directly. When the DSN is
 * empty (dev/test), every function is a no-op and the SDK is never loaded.
 *
 * PERFORMANCE (UX Move 6 — "speed as a feature"): `@sentry/react` and its
 * transitive `@sentry/*` packages weigh ~2.3 MB and previously sat in the
 * eager root-layout entry chunk via a static `import * as Sentry`. They are
 * now pulled in through a lazy `import('@sentry/react')` (in `sentryLoader`) so
 * the SDK lives in its own async chunk, entirely off the first-paint critical
 * path — and is never fetched at all when the DSN is empty.
 */

import { loadSentryAdapter } from './sentryLoader';
import env from '../../../config/environment';
import { isValueDefined } from '../../../utils/is';

import type { SentryApi, SentryInit } from './sentryLoader';
import type { SeverityLevel } from '@sentry/react';

/** Extra context attached to a Sentry event. */
interface SentryContext {
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

const dsn = String(env.SENTRY_DSN);
const isEnabled = dsn !== '';

/** Cached promise of the initialised SDK adapter; null until first use. */
let sentryPromise: Promise<SentryApi | null> | null = null;

/**
 * Lazily import and initialise the Sentry SDK exactly once, returning a small
 * adapter. Resolves to null when disabled or if the dynamic import fails, so
 * callers never throw.
 */
async function loadSentry(): Promise<SentryApi | null> {
  if (!isEnabled) return null;
  const config: SentryInit = {
    dsn,
    environment: String(env.SENTRY_ENVIRONMENT),
    tracesSampleRate: Number(env.SENTRY_TRACES_SAMPLE_RATE),
    sendDefaultPii: false,
  };
  sentryPromise ??= loadSentryAdapter(config).catch(() => null);
  return sentryPromise;
}

/** Run a callback once the SDK is loaded. No-op (and no download) when disabled. */
function withSentry(fn: (api: SentryApi) => void): void {
  if (!isEnabled) return;
  loadSentry()
    .then((api) => {
      if (isValueDefined(api)) fn(api);
    })
    .catch(() => undefined);
}

/**
 * Initialise Sentry. Called once at app startup. Does nothing when the DSN is
 * empty. The SDK load happens asynchronously via a dynamic import so it never
 * blocks first paint.
 */
function initSentry(): void {
  if (!isEnabled) return;
  loadSentry().catch(() => undefined);
}

/** Report an exception to Sentry. No-op when disabled. */
function captureException(error: unknown, context?: SentryContext): void {
  withSentry((api) => {
    api.captureException(error, {
      extra: context?.extra,
      tags: context?.tags,
    });
  });
}

/** Send a text message to Sentry. No-op when disabled. */
function captureMessage(message: string, level?: SeverityLevel): void {
  withSentry((api) => {
    api.captureMessage(message, level);
  });
}

/**
 * Associate the current session with a user.
 * Only opaque IDs are sent -- never PII.
 */
function setSentryUser(userId: string, tenantId?: string): void {
  withSentry((api) => {
    api.setUser({
      id: userId,
      ...(typeof tenantId === 'string' && tenantId !== '' ? { tenantId } : {}),
    });
  });
}

/** Clear the user scope (e.g. on logout). */
function clearSentryUser(): void {
  withSentry((api) => {
    api.setUser(null);
  });
}

export { initSentry, captureException, captureMessage, setSentryUser, clearSentryUser };
export type { SentryContext };
