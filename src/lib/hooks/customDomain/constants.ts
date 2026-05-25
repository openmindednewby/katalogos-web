/** React Query cache keys for custom domain queries. */
export const CUSTOM_DOMAIN_QUERY_KEYS = {
  domain: ['custom-domain', 'current'] as const,
} as const;

/** Polling interval while domain is pending verification (30 seconds). */
export const VERIFICATION_POLL_INTERVAL_MS = 30_000;

/** Polling interval when domain is active (disabled). */
export const VERIFICATION_POLL_INTERVAL_ACTIVE_MS = 0;
