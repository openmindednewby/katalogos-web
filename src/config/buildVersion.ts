import { isNotEmptyString } from '@dloizides/utils';

/**
 * The build id this bundle is running — surfaced by the `BuildInfoFooter` so any operator (or us,
 * over their shoulder) can read which build is live without opening dev tools.
 *
 * Expo only inlines `EXPO_PUBLIC_*` env into the client bundle, and only for DIRECT
 * `process.env.EXPO_PUBLIC_*` access (never via an aliased object), so CI stamps
 * `EXPO_PUBLIC_BUILD_VERSION` (the same git sha it hands `@dloizides/pwa-sw`'s `PWA_BUILD_VERSION`
 * for the service-worker cache key — one id, both places). A local `expo start` with nothing set
 * falls back to `dev`.
 */
const FALLBACK_BUILD_VERSION = 'dev';

/** The stamped build id, or `dev` when unset (local runs). */
export function buildVersion(): string {
  // Direct literal access so Metro/Babel inlines the value at build time.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const stamped: string | undefined = process.env.EXPO_PUBLIC_BUILD_VERSION;
  return isNotEmptyString(stamped) ? stamped : FALLBACK_BUILD_VERSION;
}
