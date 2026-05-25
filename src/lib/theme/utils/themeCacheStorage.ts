/**
 * localStorage cache utilities for tenant theme configuration.
 *
 * Provides read/write/clear operations with automatic expiry.
 * All operations are safe (no-throw) and return null on failure.
 */
import { isValueDefined } from '../../../utils/is';
import { logger } from '../../../utils/logger';

import type { TenantThemeConfig } from '../../../theme/types';
import type { CachedThemeData } from '../themeCacheTypes';

const CACHE_KEY_PREFIX = 'tenant-theme-';

/** Maximum cache age: 24 hours in milliseconds */
const HOURS_PER_DAY = 24;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;
const MS_PER_SECOND = 1000;
const MAX_CACHE_AGE_MS =
  HOURS_PER_DAY * MINUTES_PER_HOUR * SECONDS_PER_MINUTE * MS_PER_SECOND;

function buildCacheKey(tenantId: string): string {
  return `${CACHE_KEY_PREFIX}${tenantId}`;
}

function isStorageAvailable(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return typeof window.localStorage !== 'undefined';
  } catch {
    return false;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return isValueDefined(value) && typeof value === 'object';
}

function isCachedThemeData(value: unknown): value is CachedThemeData {
  if (!isRecord(value)) return false;
  const hasConfig = isValueDefined(value.config) && typeof value.config === 'object';
  const hasCachedAt = typeof value.cachedAt === 'number';
  return hasConfig && hasCachedAt;
}

/**
 * Read cached theme data from localStorage.
 * Returns null if cache is missing, expired, or corrupt.
 */
export function readThemeCache(tenantId: string): CachedThemeData | null {
  if (!isStorageAvailable()) return null;

  try {
    const raw = localStorage.getItem(buildCacheKey(tenantId));
    if (!isValueDefined(raw)) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!isCachedThemeData(parsed)) return null;

    const age = Date.now() - parsed.cachedAt;
    if (age > MAX_CACHE_AGE_MS) return null;

    return parsed;
  } catch (error) {
    logger.warn('themeCacheStorage', 'Failed to read theme cache', error);
    return null;
  }
}

/**
 * Write theme data to localStorage cache.
 */
export function writeThemeCache(tenantId: string, config: TenantThemeConfig, etag: string): void {
  if (!isStorageAvailable()) return;

  const data: CachedThemeData = {
    config,
    logoUrl: config.branding.logoContentId,
    faviconUrl: config.branding.faviconContentId,
    etag,
    cachedAt: Date.now(),
  };

  try {
    localStorage.setItem(buildCacheKey(tenantId), JSON.stringify(data));
  } catch (error) {
    logger.warn('themeCacheStorage', 'Failed to write theme cache', error);
  }
}

/**
 * Clear cached theme data for a specific tenant.
 */
export function clearThemeCache(tenantId: string): void {
  if (!isStorageAvailable()) return;

  try {
    localStorage.removeItem(buildCacheKey(tenantId));
  } catch (error) {
    logger.warn('themeCacheStorage', 'Failed to clear theme cache', error);
  }
}

/**
 * Clear all tenant theme caches from localStorage.
 * Used during logout to remove any tenant-specific data.
 */
export function clearAllThemeCaches(): void {
  if (!isStorageAvailable()) return;

  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (isValueDefined(key) && key.startsWith(CACHE_KEY_PREFIX))
        keysToRemove.push(key);
    }
    for (const key of keysToRemove) localStorage.removeItem(key);
  } catch (error) {
    logger.warn('themeCacheStorage', 'Failed to clear all theme caches', error);
  }
}

export { MAX_CACHE_AGE_MS, CACHE_KEY_PREFIX };
