
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

let sentryPromise: Promise<SentryApi | null> | null = null;

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

function withSentry(fn: (api: SentryApi) => void): void {
  if (!isEnabled) return;
  loadSentry()
    .then((api) => {
      if (isValueDefined(api)) fn(api);
    })
    .catch(() => undefined);
}

/** Initialise Sentry. Called once at app startup. Does nothing when the DSN is */
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

/** Associate the current session with a user. */
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
