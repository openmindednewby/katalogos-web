/**
 * Sentry error monitoring wrapper.
 *
 * All Sentry SDK access is isolated to this module so nothing else
 * imports `@sentry/react` directly. When the DSN is empty (dev/test),
 * every function is a no-op and Sentry.init is never called.
 */

import * as Sentry from '@sentry/react';

import env from '../../config/environment';

const enum SeverityLevel {
  Debug = 'debug',
  Error = 'error',
  Fatal = 'fatal',
  Info = 'info',
  Log = 'log',
  Warning = 'warning',
}

/** Extra context attached to a Sentry event. */
interface SentryContext {
  extra?: Record<string, unknown>;
  tags?: Record<string, string>;
}

const dsn = String(env.SENTRY_DSN);
const isEnabled = dsn !== '';

/**
 * Initialise Sentry. Must be called once at app startup.
 * Does nothing when DSN is empty.
 */
function initSentry(): void {
  if (!isEnabled) return;

  Sentry.init({
    dsn,
    environment: String(env.SENTRY_ENVIRONMENT),
    tracesSampleRate: Number(env.SENTRY_TRACES_SAMPLE_RATE),
    sendDefaultPii: false,
  });
}

/** Report an exception to Sentry. No-op when disabled. */
function captureException(error: unknown, context?: SentryContext): void {
  if (!isEnabled) return;

  Sentry.captureException(error, {
    extra: context?.extra,
    tags: context?.tags,
  });
}

/** Send a text message to Sentry. No-op when disabled. */
function captureMessage(message: string, level?: SeverityLevel): void {
  if (!isEnabled) return;

  Sentry.captureMessage(message, level);
}

/**
 * Associate the current session with a user.
 * Only opaque IDs are sent -- never PII.
 */
function setSentryUser(userId: string, tenantId?: string): void {
  if (!isEnabled) return;

  Sentry.setUser({
    id: userId,
    ...(typeof tenantId === 'string' && tenantId !== '' ? { tenantId } : {}),
  });
}

/** Clear the user scope (e.g. on logout). */
function clearSentryUser(): void {
  if (!isEnabled) return;

  Sentry.setUser(null);
}

export { initSentry, captureException, captureMessage, setSentryUser, clearSentryUser };
export type { SentryContext };
