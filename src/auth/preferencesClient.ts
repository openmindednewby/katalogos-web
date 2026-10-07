import { createPreferencesClient, createFetchHttpClient } from '@dloizides/auth-web';

import type {
  PreferredMethodClient,
  HttpRequest,
  HttpResponse,
} from '@dloizides/auth-web';

async function lazyFetch(request: HttpRequest): Promise<HttpResponse> {
  if (typeof fetch !== 'function')
    throw new Error('preferencesClient: fetch is not available in this environment');
  return createFetchHttpClient(fetch.bind(globalThis))(request);
}

/** Shared same-origin preferred-method client. Built once, reused by every surface. */
export const preferencesClient: PreferredMethodClient = createPreferencesClient({
  http: lazyFetch,
});
