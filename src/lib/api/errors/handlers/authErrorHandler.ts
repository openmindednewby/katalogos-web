/**
 * Auth error handler utilities.
 *
 * Provides helpers for detecting auth-related endpoints so that
 * error rules can skip redirects on login/refresh/verify pages.
 */

/** URL patterns that indicate an authentication endpoint */
const AUTH_ENDPOINT_PATTERNS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/verify-otp',
  '/auth/register',
  '/protocol/openid-connect/token',
];

/**
 * Check if a URL points to an authentication endpoint.
 * Used by the error registry's skipIf for the 401 rule
 * to avoid redirect loops on auth pages.
 */
function isAuthEndpoint(url: string): boolean {
  return AUTH_ENDPOINT_PATTERNS.some((pattern) => url.includes(pattern));
}

/**
 * Check if a URL is a token refresh endpoint specifically.
 * Useful for distinguishing refresh failures from other auth errors.
 */
function isTokenRefreshEndpoint(url: string): boolean {
  return url.includes('/auth/refresh') || url.includes('/protocol/openid-connect/token');
}

export { isAuthEndpoint, isTokenRefreshEndpoint, AUTH_ENDPOINT_PATTERNS };
