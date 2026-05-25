/**
 * The app's shared, same-origin `BffAuthClient` singleton.
 *
 * Unified-auth Phase 1c: the lazy-`fetch` wiring that used to live in the local
 * `bffAuthClient.ts` is now owned by `@dloizides/auth-web` — `createBffAuthClient()`
 * is the one correct way to build a same-origin BFF client (lazy `fetch`,
 * side-effect-free module load, no token handling). This module is just the
 * one-line app-level singleton every auth surface shares.
 *
 * `baseUrl` is omitted → same-origin: every `/bff/*` call goes to the SPA's own
 * host, which (post-ingress-flip) is fronted by `bff-katalogos`.
 */
import { createBffAuthClient } from '@dloizides/auth-web';

import type { BffAuthClient } from '@dloizides/auth-web';

/** Shared same-origin BFF client. Built once, reused by every auth surface. */
export const bffAuthClient: BffAuthClient = createBffAuthClient();
