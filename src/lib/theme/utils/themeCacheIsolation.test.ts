/**
 * Integration tests for tenant theme cache isolation.
 *
 * Complements themeCacheStorage.test.ts by verifying multi-tenant isolation:
 * that writing/reading/clearing for one tenant does not affect another.
 */
import {
  readThemeCache,
  writeThemeCache,
  clearThemeCache,
  CACHE_KEY_PREFIX,
} from './themeCacheStorage';

import type { TenantThemeConfig } from '../../../theme/types';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const TENANT_A = 'tenant-alpha';
const TENANT_B = 'tenant-beta';
const ETAG_A = '"etag-alpha"';
const ETAG_B = '"etag-beta"';

const CONFIG_A: TenantThemeConfig = {
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
    logoContentId: 'logo-alpha',
    faviconContentId: 'favicon-alpha',
    presetId: 'default',
  },
};

const CONFIG_B: TenantThemeConfig = {
  primary: '#c2410c',
  secondary: '#a21caf',
  accent: '#ea580c',
  light: {
    background: '#ffffff',
    surface: '#fff7ed',
    surfaceElevated: '#ffffff',
    text: '#431407',
    textSecondary: '#78716c',
    border: '#fed7aa',
    divider: '#ffedd5',
  },
  dark: {
    background: '#1c0f0a',
    surface: '#2d1810',
    surfaceElevated: '#3d2218',
    text: '#ffedd5',
    textSecondary: '#fdba74',
    border: '#5c3520',
    divider: '#4a2a18',
  },
  branding: {
    logoContentId: 'logo-beta',
    faviconContentId: 'favicon-beta',
    presetId: 'sunset',
  },
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('theme cache tenant isolation', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('write and read back for tenant A does not affect tenant B', () => {
    writeThemeCache(TENANT_A, CONFIG_A, ETAG_A);

    const resultA = readThemeCache(TENANT_A);
    const resultB = readThemeCache(TENANT_B);

    expect(resultA).not.toBeNull();
    expect(resultA?.config.primary).toBe(CONFIG_A.primary);
    expect(resultB).toBeNull();
  });

  it('two tenants can have independent caches', () => {
    writeThemeCache(TENANT_A, CONFIG_A, ETAG_A);
    writeThemeCache(TENANT_B, CONFIG_B, ETAG_B);

    const resultA = readThemeCache(TENANT_A);
    const resultB = readThemeCache(TENANT_B);

    expect(resultA?.config.primary).toBe(CONFIG_A.primary);
    expect(resultA?.etag).toBe(ETAG_A);

    expect(resultB?.config.primary).toBe(CONFIG_B.primary);
    expect(resultB?.etag).toBe(ETAG_B);
  });

  it('clearing tenant A cache does not affect tenant B', () => {
    writeThemeCache(TENANT_A, CONFIG_A, ETAG_A);
    writeThemeCache(TENANT_B, CONFIG_B, ETAG_B);

    clearThemeCache(TENANT_A);

    expect(readThemeCache(TENANT_A)).toBeNull();
    expect(readThemeCache(TENANT_B)).not.toBeNull();
    expect(readThemeCache(TENANT_B)?.config.primary).toBe(CONFIG_B.primary);
  });

  it('overwriting tenant A cache does not affect tenant B', () => {
    writeThemeCache(TENANT_A, CONFIG_A, ETAG_A);
    writeThemeCache(TENANT_B, CONFIG_B, ETAG_B);

    const updatedConfig: TenantThemeConfig = {
      ...CONFIG_A,
      primary: '#ff0000',
    };
    writeThemeCache(TENANT_A, updatedConfig, '"etag-updated"');

    const resultA = readThemeCache(TENANT_A);
    const resultB = readThemeCache(TENANT_B);

    expect(resultA?.config.primary).toBe('#ff0000');
    expect(resultB?.config.primary).toBe(CONFIG_B.primary);
  });

  it('each tenant has a unique cache key', () => {
    writeThemeCache(TENANT_A, CONFIG_A, ETAG_A);
    writeThemeCache(TENANT_B, CONFIG_B, ETAG_B);

    const keyA = `${CACHE_KEY_PREFIX}${TENANT_A}`;
    const keyB = `${CACHE_KEY_PREFIX}${TENANT_B}`;

    expect(keyA).not.toBe(keyB);
    expect(localStorage.getItem(keyA)).not.toBeNull();
    expect(localStorage.getItem(keyB)).not.toBeNull();
  });
});
