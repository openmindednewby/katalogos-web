/**
 * Stress tests for tenant theme localStorage cache utilities.
 * Tests multi-tenant isolation, expiry logic, corruption handling,
 * and high-volume write/read cycles.
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

// -- Constants ----------------------------------------------------------------

const MULTI_TENANT_COUNT = 50;
const JUST_EXPIRED_OFFSET = 1;

// -- Helpers ------------------------------------------------------------------

function makeTenantConfig(primary: string): TenantThemeConfig {
  return {
    primary,
    secondary: '#669933',
    accent: '#993366',
    light: {
      background: '#ffffff',
      surface: '#f5f5f5',
      surfaceElevated: '#ffffff',
      text: '#111111',
      textSecondary: '#666666',
      border: '#dddddd',
      divider: '#eeeeee',
    },
    dark: {
      background: '#111111',
      surface: '#222222',
      surfaceElevated: '#333333',
      text: '#eeeeee',
      textSecondary: '#aaaaaa',
      border: '#444444',
      divider: '#555555',
    },
    branding: { logoContentId: null, faviconContentId: null, presetId: null },
  };
}

function tenantId(index: number): string {
  return `stress-tenant-${index}`;
}

function etag(index: number): string {
  return `"etag-${index}"`;
}

// -- Tests --------------------------------------------------------------------

describe('theme cache stress', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('multi-tenant write and read', () => {
    it(`writes and reads ${MULTI_TENANT_COUNT} different tenant themes`, () => {
      const configs: TenantThemeConfig[] = [];

      for (let i = 0; i < MULTI_TENANT_COUNT; i++) {
        const hex = `#${i.toString(16).padStart(6, '0')}`;
        const config = makeTenantConfig(hex);
        configs.push(config);
        writeThemeCache(tenantId(i), config, etag(i));
      }

      for (let i = 0; i < MULTI_TENANT_COUNT; i++) {
        const cached = readThemeCache(tenantId(i));
        expect(cached).not.toBeNull();
        expect(cached?.config.primary).toBe(configs[i].primary);
        expect(cached?.etag).toBe(etag(i));
      }
    });

    it('tenant caches are isolated -- clearing one does not affect others', () => {
      const configA = makeTenantConfig('#aaaaaa');
      const configB = makeTenantConfig('#bbbbbb');
      writeThemeCache('tenant-a', configA, '"etag-a"');
      writeThemeCache('tenant-b', configB, '"etag-b"');

      clearThemeCache('tenant-a');

      expect(readThemeCache('tenant-a')).toBeNull();
      expect(readThemeCache('tenant-b')).not.toBeNull();
      expect(readThemeCache('tenant-b')?.config.primary).toBe('#bbbbbb');
    });

    it('overwriting a tenant cache replaces previous data', () => {
      const configV1 = makeTenantConfig('#111111');
      const configV2 = makeTenantConfig('#222222');
      writeThemeCache('tenant-x', configV1, '"v1"');
      writeThemeCache('tenant-x', configV2, '"v2"');

      const cached = readThemeCache('tenant-x');
      expect(cached?.config.primary).toBe('#222222');
      expect(cached?.etag).toBe('"v2"');
    });
  });

  describe('cache expiry logic', () => {
    it('returns data when cache is exactly at max age', () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      const config = makeTenantConfig('#336699');
      writeThemeCache('tenant-edge', config, '"edge"');

      jest.setSystemTime(now + MAX_CACHE_AGE_MS);
      const cached = readThemeCache('tenant-edge');
      expect(cached).not.toBeNull();
    });

    it('returns null when cache is just past max age', () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      const config = makeTenantConfig('#336699');
      writeThemeCache('tenant-expired', config, '"expired"');

      jest.setSystemTime(now + MAX_CACHE_AGE_MS + JUST_EXPIRED_OFFSET);
      const cached = readThemeCache('tenant-expired');
      expect(cached).toBeNull();
    });

    it('returns valid data when cache is fresh (1 second old)', () => {
      jest.useFakeTimers();
      const now = Date.now();
      jest.setSystemTime(now);

      const config = makeTenantConfig('#aabb00');
      writeThemeCache('tenant-fresh', config, '"fresh"');

      const ONE_SECOND = 1000;
      jest.setSystemTime(now + ONE_SECOND);
      const cached = readThemeCache('tenant-fresh');
      expect(cached).not.toBeNull();
      expect(cached?.config.primary).toBe('#aabb00');
    });

    it('handles very old timestamps gracefully', () => {
      jest.useFakeTimers();
      const VERY_OLD = 1000000000000;
      jest.setSystemTime(VERY_OLD);

      const config = makeTenantConfig('#old000');
      writeThemeCache('tenant-old', config, '"old"');

      const FAR_FUTURE = 9000000000000;
      jest.setSystemTime(FAR_FUTURE);
      expect(readThemeCache('tenant-old')).toBeNull();
    });
  });

  describe('corrupted cache data', () => {
    it('returns null for completely invalid JSON', () => {
      localStorage.setItem(`${CACHE_KEY_PREFIX}corrupt-1`, '{not valid json!!!');
      expect(readThemeCache('corrupt-1')).toBeNull();
    });

    it('returns null for empty string in cache', () => {
      localStorage.setItem(`${CACHE_KEY_PREFIX}corrupt-2`, '');
      expect(readThemeCache('corrupt-2')).toBeNull();
    });

    it('returns null for JSON array instead of object', () => {
      localStorage.setItem(`${CACHE_KEY_PREFIX}corrupt-3`, '[1,2,3]');
      expect(readThemeCache('corrupt-3')).toBeNull();
    });

    it('returns null for JSON with missing config field', () => {
      const noConfig = JSON.stringify({ etag: '"e"', cachedAt: Date.now() });
      localStorage.setItem(`${CACHE_KEY_PREFIX}corrupt-4`, noConfig);
      expect(readThemeCache('corrupt-4')).toBeNull();
    });

    it('returns null for JSON with missing cachedAt field', () => {
      const noCachedAt = JSON.stringify({ config: { primary: '#aaa' } });
      localStorage.setItem(`${CACHE_KEY_PREFIX}corrupt-5`, noCachedAt);
      expect(readThemeCache('corrupt-5')).toBeNull();
    });

    it('returns null for JSON string "null"', () => {
      localStorage.setItem(`${CACHE_KEY_PREFIX}corrupt-6`, 'null');
      expect(readThemeCache('corrupt-6')).toBeNull();
    });

    it('returns null for JSON number', () => {
      localStorage.setItem(`${CACHE_KEY_PREFIX}corrupt-7`, '42');
      expect(readThemeCache('corrupt-7')).toBeNull();
    });

    it('returns null for JSON boolean', () => {
      localStorage.setItem(`${CACHE_KEY_PREFIX}corrupt-8`, 'true');
      expect(readThemeCache('corrupt-8')).toBeNull();
    });
  });

  describe('clearAllThemeCaches stress', () => {
    it(`clears ${MULTI_TENANT_COUNT} cached tenants while preserving non-theme keys`, () => {
      localStorage.setItem('app-settings', 'keep');
      localStorage.setItem('user-prefs', 'keep');

      for (let i = 0; i < MULTI_TENANT_COUNT; i++)
        writeThemeCache(tenantId(i), makeTenantConfig('#000000'), etag(i));

      const OVERHEAD_KEYS = 2;
      expect(localStorage.length).toBe(MULTI_TENANT_COUNT + OVERHEAD_KEYS);

      clearAllThemeCaches();

      expect(localStorage.length).toBe(OVERHEAD_KEYS);
      expect(localStorage.getItem('app-settings')).toBe('keep');
      expect(localStorage.getItem('user-prefs')).toBe('keep');

      for (let i = 0; i < MULTI_TENANT_COUNT; i++)
        expect(readThemeCache(tenantId(i))).toBeNull();
    });
  });

  describe('localStorage error resilience', () => {
    it('writeThemeCache does not throw when setItem throws', () => {
      jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      expect(() => writeThemeCache('t1', makeTenantConfig('#111'), '"e"')).not.toThrow();
    });

    it('readThemeCache returns null when getItem throws', () => {
      jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });
      expect(readThemeCache('t1')).toBeNull();
    });

    it('clearThemeCache does not throw when removeItem throws', () => {
      jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('UnknownError');
      });
      expect(() => clearThemeCache('t1')).not.toThrow();
    });

    it('clearAllThemeCaches does not throw when key() throws', () => {
      jest.spyOn(Storage.prototype, 'key').mockImplementation(() => {
        throw new Error('UnknownError');
      });
      expect(() => clearAllThemeCaches()).not.toThrow();
    });
  });

  describe('cache key format', () => {
    it('cache keys use the expected prefix', () => {
      writeThemeCache('my-tenant', makeTenantConfig('#aabbcc'), '"e"');
      const expectedKey = `${CACHE_KEY_PREFIX}my-tenant`;
      expect(localStorage.getItem(expectedKey)).not.toBeNull();
    });

    it('tenants with similar IDs do not collide', () => {
      writeThemeCache('abc', makeTenantConfig('#111111'), '"e1"');
      writeThemeCache('abc-extra', makeTenantConfig('#222222'), '"e2"');

      expect(readThemeCache('abc')?.config.primary).toBe('#111111');
      expect(readThemeCache('abc-extra')?.config.primary).toBe('#222222');
    });
  });
});
