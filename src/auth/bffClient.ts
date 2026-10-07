import { createBffAuthClient } from '@dloizides/auth-web';

import type { BffAuthClient } from '@dloizides/auth-web';

/** Shared same-origin BFF client. Built once, reused by every auth surface. */
export const bffAuthClient: BffAuthClient = createBffAuthClient();
