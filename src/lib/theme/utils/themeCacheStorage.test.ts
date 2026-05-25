/**
 * Unit tests for tenant theme localStorage cache utilities.
 *
 * Tests cache read/write/clear logic, expiry, and error handling.
 * Does NOT test rendering - focuses on pure logic.
 */
import {
  readThemeCache,
  writeThemeCache,
  clearThemeCache,
  clearAllThemeCaches,
  MAX_CACHE_AGE_MS,
  CACHE_KEY_PREFIX,
} from './themeCacheStorage';

import type { TenantThemeConfig } from '../../../theme/types';
import type { CachedThemeData } from '../themeCacheTypes';

// -- Test fixtures -----------------------------------------------------------

const TEST_TENANT_ID = 'tenant-123';
const TEST_CACHE_KEY = `${CACHE_KEY_PREFIX}${TEST_TENANT_ID}`;

const MOCK_CONFIG: TenantThemeConfig = {
  primary: '#005f73',
  secondary: '#94d2bd',
  accent: '#008d5c',
  light: {
    background: '#ffffff',
    surface: '#f7f7f7',
    surfaceElevated: '#ffffff',
    text: '#001219',
    textSecondary: '#777777',
    border: '#e6e6e6',
    divider: '#e6e6e6',
  },
  dark: {
    background: '#001219',
    surface: '#052f33',
    surfaceElevated: '#073b40',
    text: '#e9d8a6',
    textSecondary: '#a8a090',
    border: '#053f40',
    divider: '#053f40',
  },
  branding: {
    logoContentId: 'logo-abc',
    faviconContentId: 'favicon-xyz',
    presetId: 'default',
  },
};

const MOCK_ETAG = '"etag-value-1"';

// -- Helpers -----------------------------------------------------------------

function createCachedData(overrides?: Partial<CachedThemeData>): CachedThemeData {
  return {
    config: MOCK_CONFIG,
    logoUrl: MOCK_CONFIG.branding.logoContentId,
    faviconUrl: MOCK_CONFIG.branding.faviconContentId,
    etag: MOCK_ETAG,
    cachedAt: Date.now(),
    ...overrides,
  };
}

// -- Tests -------------------------------------------------------------------

describe('themeCacheStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  describe('writeThemeCache', () => {
    it('writes cache data to localStorage', () => {
      writeThemeCache(TEST_TENANT_ID, MOCK_CONFIG, MOCK_ETAG);

      const stored = localStorage.getItem(TEST_CACHE_KEY);
      expect(stored).not.toBeNull();

      const parsed = JSON.parse(stored!) as CachedThemeData;
      expect(parsed.config).toEqual(MOCK_CONFIG);
      expect(parsed.etag).toBe(MOCK_ETAG);
      expect(parsed.logoUrl).toBe(MOCK_CONFIG.branding.logoContentId);
      expect(parsed.faviconUrl).toBe(MOCK_CONFIG.branding.faviconContentId);
      expect(typeof parsed.cachedAt).toBe('number');
    });

    it('does not throw when localStorage is unavailable', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      expect(() => writeThemeCache(TEST_TENANT_ID, MOCK_CONFIG, MOCK_ETAG)).not.toThrow();
    });
  });

  describe('readThemeCache', () => {
    it('returns cached data when valid and not expired', () => {
      const data = createCachedData();
      localStorage.setItem(TEST_CACHE_KEY, JSON.stringify(data));

      const result = readThemeCache(TEST_TENANT_ID);
      expect(result).not.toBeNull();
      expect(result?.config).toEqual(MOCK_CONFIG);
      expect(result?.etag).toBe(MOCK_ETAG);
    });

    it('returns null when no cache exists', () => {
      const result = readThemeCache(TEST_TENANT_ID);
      expect(result).toBeNull();
    });

    it('returns null when cache is expired', () => {
      const expiredTimestamp = Date.now() - MAX_CACHE_AGE_MS - 1;
      const data = createCachedData({ cachedAt: expiredTimestamp });
      localStorage.setItem(TEST_CACHE_KEY, JSON.stringify(data));

      const result = readThemeCache(TEST_TENANT_ID);
      expect(result).toBeNull();
    });

    it('returns null when cache data is corrupt JSON', () => {
      localStorage.setItem(TEST_CACHE_KEY, 'not-valid-json');

      const result = readThemeCache(TEST_TENANT_ID);
      expect(result).toBeNull();
    });

    it('returns null when cache is missing required fields', () => {
      localStorage.setItem(TEST_CACHE_KEY, JSON.stringify({ unrelated: true }));

      const result = readThemeCache(TEST_TENANT_ID);
      expect(result).toBeNull();
    });

    it('does not throw when localStorage throws', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });

      expect(() => readThemeCache(TEST_TENANT_ID)).not.toThrow();
      expect(readThemeCache(TEST_TENANT_ID)).toBeNull();
    });
  });

  describe('clearThemeCache', () => {
    it('removes the cache entry for the specified tenant', () => {
      writeThemeCache(TEST_TENANT_ID, MOCK_CONFIG, MOCK_ETAG);
      expect(localStorage.getItem(TEST_CACHE_KEY)).not.toBeNull();

      clearThemeCache(TEST_TENANT_ID);
      expect(localStorage.getItem(TEST_CACHE_KEY)).toBeNull();
    });

    it('does not throw when cache does not exist', () => {
      expect(() => clearThemeCache('non-existent')).not.toThrow();
    });
  });

  describe('clearAllThemeCaches', () => {
    it('removes all tenant theme cache entries', () => {
      writeThemeCache('tenant-1', MOCK_CONFIG, MOCK_ETAG);
      writeThemeCache('tenant-2', MOCK_CONFIG, MOCK_ETAG);
      localStorage.setItem('unrelated-key', 'keep-me');

      clearAllThemeCaches();

      expect(localStorage.getItem(`${CACHE_KEY_PREFIX}tenant-1`)).toBeNull();
      expect(localStorage.getItem(`${CACHE_KEY_PREFIX}tenant-2`)).toBeNull();
      expect(localStorage.getItem('unrelated-key')).toBe('keep-me');
    });

    it('does not throw on empty localStorage', () => {
      expect(() => clearAllThemeCaches()).not.toThrow();
    });
  });
});
