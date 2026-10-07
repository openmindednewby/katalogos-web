import type { SeverityLevel } from '@sentry/react';

/** Options forwarded to `Sentry.init`. */
export interface SentryInit {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  sendDefaultPii: boolean;
}

/** The minimal, initialised Sentry surface this app uses. */
export interface SentryApi {
  captureException: (error: unknown, hint: { extra?: Record<string, unknown>; tags?: Record<string, string> }) => void;
  captureMessage: (message: string, level?: SeverityLevel) => void;
  setUser: (user: { id: string; tenantId?: string } | null) => void;
}

/** Dynamic-import seam for @sentry/react. */
export async function loadSentryAdapter(config: SentryInit): Promise<SentryApi> {
  const sentry = await import('@sentry/react');
  sentry.init(config);
  return {
    captureException: (error, hint) => { sentry.captureException(error, hint); },
    captureMessage: (message, level) => { sentry.captureMessage(message, level); },
    setUser: (user) => { sentry.setUser(user); },
  };
}
