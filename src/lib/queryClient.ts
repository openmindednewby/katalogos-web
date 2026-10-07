import { QueryCache, QueryClient, MutationCache } from '@tanstack/react-query';

import { isValueDefined } from '../utils/is';
import { logger } from '../utils/logger';
import { ErrorSeverity } from './api/errors/errorTypes';
import { apiEventBus } from './api/events/apiEventBus';

const MS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const MS_PER_MINUTE = MS_PER_SECOND * SECONDS_PER_MINUTE;

const STALE_TIME_MINUTES = 1;
const GC_TIME_MINUTES = 10;
const STALE_TIME_LONG_MINUTES = 5;


const CLIENT_ERROR_MIN = 400;
const CLIENT_ERROR_MAX = 499;


const MUTATION_RETRY_COUNT = 0;

/** Query cache duration constants. */
export const QUERY_CACHE = {
  /** How long data is considered fresh (won't refetch) */
  STALE_TIME_MS: STALE_TIME_MINUTES * MS_PER_MINUTE,
  /** How long inactive data stays in cache before garbage collection */
  GC_TIME_MS: GC_TIME_MINUTES * MS_PER_MINUTE,
  /** Longer stale time for less frequently changing data */
  STALE_TIME_LONG_MS: STALE_TIME_LONG_MINUTES * MS_PER_MINUTE,
} as const;

/** Query key factories for consistent cache key management. */
export const queryKeys = {
  tenants: {
    all: ['tenants'] as const,
    list: () => [...queryKeys.tenants.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.tenants.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.users.all, 'detail', id] as const,
    byTenant: (tenantId: string) => [...queryKeys.users.all, 'tenant', tenantId] as const,
  },
  templates: {
    all: ['templates'] as const,
    list: () => [...queryKeys.templates.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.templates.all, 'detail', id] as const,
  },
  questioners: {
    all: ['questioners'] as const,
    list: () => [...queryKeys.questioners.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.questioners.all, 'detail', id] as const,
    completed: () => [...queryKeys.questioners.all, 'completed'] as const,
  },
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
  },
  tenantTheme: {
    all: ['tenantTheme'] as const,
    byTenant: (tenantId: string) => [...queryKeys.tenantTheme.all, tenantId] as const,
  },
} as const;

interface ErrorWithStatus {
  status: number;
}

interface ErrorWithResponse {
  response: ErrorWithStatus;
}

/** Determines whether a failed query should be retried. */
export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  const status = extractStatusCode(error);
  const isClientError = status >= CLIENT_ERROR_MIN && status <= CLIENT_ERROR_MAX;
  if (isClientError) return false;

  const maxRetries = 1;
  return failureCount < maxRetries;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return isValueDefined(value) && typeof value === 'object';
}

function isErrorWithStatus(value: unknown): value is ErrorWithStatus {
  if (!isRecord(value)) return false;
  if (!('status' in value)) return false;
  return typeof value.status === 'number';
}

function isErrorWithResponse(value: unknown): value is ErrorWithResponse {
  if (!isRecord(value)) return false;
  return 'response' in value;
}

function extractStatusCode(error: unknown): number {
  if (isErrorWithStatus(error)) return error.status;
  if (isErrorWithResponse(error) && isErrorWithStatus(error.response))
    return error.response.status;
  return 0;
}


function handleQueryCacheError(error: unknown, query: { state: { data: unknown } }): void {
  const hasStaleData = isValueDefined(query.state.data);
  if (hasStaleData) {
    logger.warn('queryClient', 'Background refetch failed, showing stale data', error);
    apiEventBus.emit({
      type: 'toast',
      severity: ErrorSeverity.Warning,
      message: 'errors.backgroundRefreshFailed',
    });
  }
}

function handleMutationCacheError(error: unknown): void {
  logger.error('queryClient', 'Unhandled mutation error', error);
}

/** Create a single QueryClient instance for the whole app. */
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleQueryCacheError,
  }),
  mutationCache: new MutationCache({
    onError: handleMutationCacheError,
  }),
  defaultOptions: {
    queries: {
      staleTime: QUERY_CACHE.STALE_TIME_MS,
      gcTime: QUERY_CACHE.GC_TIME_MS,
      retry: shouldRetryQuery,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
    mutations: {
      retry: MUTATION_RETRY_COUNT,
    },
  },
});

/** Helper to invalidate queries after mutations. */
export async function invalidateQueries(queryKey: readonly unknown[]): Promise<void> {
  await queryClient.invalidateQueries({ queryKey });
}

export default queryClient;
