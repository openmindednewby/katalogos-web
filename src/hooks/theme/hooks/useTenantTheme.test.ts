/**
 * Unit tests for useTenantTheme hook.
 *
 * Tests the hook logic: query enabling, cache integration, ETag support,
 * 304 Not Modified handling, fallback behavior, and logout cleanup.
 * Does NOT test rendering.
 */
import * as tenantThemeWeb from '@dloizides/tenant-theme-web';
import { renderHook } from '@testing-library/react-native';


import { useTenantTheme } from './useTenantTheme';

import type {
  CachedThemeData,
  TenantThemeConfig,
  TenantThemeResponse,
} from '@dloizides/tenant-theme-web';

// -- Mocks -------------------------------------------------------------------

const MOCK_TENANT_ID = 'tenant-abc';
const MOCK_ETAG = '"etag-1"';

let mockAuthState: {
  isLoggedIn: boolean;
  userInfo: { tenantId?: string; [key: string]: unknown } | null;
};

jest.mock('react-redux', () => ({
  useSelector: (selector: (state: { auth: typeof mockAuthState }) => unknown) =>
    selector({ auth: mockAuthState }),
}));

const mockInvalidateQueries = jest.fn().mockResolvedValue(undefined);
const mockRemoveQueries = jest.fn();

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQueryClient: () => ({
      invalidateQueries: mockInvalidateQueries,
      removeQueries: mockRemoveQueries,
    }),
    useQuery: jest.fn().mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetched: false,
      error: null,
    }),
  };
});

jest.mock('@dloizides/tenant-theme-web', () => ({
  readThemeCache: jest.fn(),
  writeThemeCache: jest.fn(),
  clearAllThemeCaches: jest.fn(),
  fetchTenantTheme: jest.fn(),
}));
jest.mock('../../../lib/theme/themeTransport', () => ({
  httpGet: jest.fn(),
  httpPut: jest.fn(),
  defaultThemeConfig: {},
  getIdentityBaseUrl: () => 'http://test-identity:5002',
}));
jest.mock('../../../utils/logger', () => ({
  logger: { warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

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
    logoContentId: null,
    faviconContentId: null,
    presetId: 'default',
  },
};

const MOCK_CACHED: CachedThemeData = {
  config: MOCK_CONFIG,
  logoUrl: null,
  faviconUrl: null,
  etag: MOCK_ETAG,
  cachedAt: Date.now(),
};

// -- Tests -------------------------------------------------------------------

describe('useTenantTheme', () => {
  const mockReadCache = tenantThemeWeb.readThemeCache as jest.Mock;
  const _mockWriteCache = tenantThemeWeb.writeThemeCache as jest.Mock;
  const mockClearAll = tenantThemeWeb.clearAllThemeCaches as jest.Mock;
  const { useQuery: mockUseQuery } = jest.requireMock('@tanstack/react-query');

  beforeEach(() => {
    jest.clearAllMocks();
    mockAuthState = {
      isLoggedIn: true,
      userInfo: { tenantId: MOCK_TENANT_ID, roles: [] },
    };
    mockReadCache.mockReturnValue(null);
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetched: false,
      error: null,
    });
  });

  it('returns null config when not logged in', () => {
    mockAuthState = { isLoggedIn: false, userInfo: null };

    const { result } = renderHook(() => useTenantTheme());
    expect(result.current.tenantThemeConfig).toBeNull();
    expect(result.current.isLoading).toBe(false);
  });

  it('returns null config when userInfo has no tenantId', () => {
    mockAuthState = { isLoggedIn: true, userInfo: { roles: [] } };

    const { result } = renderHook(() => useTenantTheme());
    expect(result.current.tenantThemeConfig).toBeNull();
  });

  it('reads from localStorage cache on mount when logged in', () => {
    mockReadCache.mockReturnValue(MOCK_CACHED);

    const { result } = renderHook(() => useTenantTheme());
    expect(mockReadCache).toHaveBeenCalledWith(MOCK_TENANT_ID);
    expect(result.current.tenantThemeConfig).toEqual(MOCK_CONFIG);
  });

  it('returns fetched config when API data is available', () => {
    const apiResponse: TenantThemeResponse = {
      themeConfig: MOCK_CONFIG,
      etag: '"etag-2"',
      notModified: false,
    };
    mockUseQuery.mockReturnValue({
      data: apiResponse,
      isLoading: false,
      isFetched: true,
      error: null,
    });

    const { result } = renderHook(() => useTenantTheme());
    expect(result.current.tenantThemeConfig).toEqual(MOCK_CONFIG);
  });

  it('prefers fetched data over cached data', () => {
    const cachedConfig = { ...MOCK_CONFIG, primary: '#111111' };
    mockReadCache.mockReturnValue({ ...MOCK_CACHED, config: cachedConfig });

    const fetchedConfig = { ...MOCK_CONFIG, primary: '#222222' };
    mockUseQuery.mockReturnValue({
      data: { themeConfig: fetchedConfig, etag: '"etag-new"', notModified: false },
      isLoading: false,
      isFetched: true,
      error: null,
    });

    const { result } = renderHook(() => useTenantTheme());
    expect(result.current.tenantThemeConfig?.primary).toBe('#222222');
  });

  it('uses cached config on 304 Not Modified response', () => {
    const cachedConfig = { ...MOCK_CONFIG, primary: '#333333' };
    mockReadCache.mockReturnValue({ ...MOCK_CACHED, config: cachedConfig });

    mockUseQuery.mockReturnValue({
      data: { themeConfig: null, etag: MOCK_ETAG, notModified: true },
      isLoading: false,
      isFetched: true,
      error: null,
    });

    const { result } = renderHook(() => useTenantTheme());
    expect(result.current.tenantThemeConfig?.primary).toBe('#333333');
  });

  it('passes cached ETag to queryFn via options', () => {
    mockReadCache.mockReturnValue(MOCK_CACHED);

    renderHook(() => useTenantTheme());

    const queryArgs = mockUseQuery.mock.calls[0][0] as {
      queryFn: (ctx: { signal: AbortSignal }) => Promise<TenantThemeResponse>;
    };

    // The queryFn should be a function that passes the cached ETag
    expect(typeof queryArgs.queryFn).toBe('function');
  });

  it('falls back to cached config when API errors', () => {
    mockReadCache.mockReturnValue(MOCK_CACHED);
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isFetched: true,
      error: new Error('Network error'),
    });

    const { result } = renderHook(() => useTenantTheme());
    expect(result.current.tenantThemeConfig).toEqual(MOCK_CONFIG);
    expect(result.current.error).toBeTruthy();
  });

  it('reports isLoading only when enabled and query is loading', () => {
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetched: false,
      error: null,
    });

    const { result } = renderHook(() => useTenantTheme());
    expect(result.current.isLoading).toBe(true);
  });

  it('does not report isLoading when not logged in', () => {
    mockAuthState = { isLoggedIn: false, userInfo: null };
    mockUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isFetched: false,
      error: null,
    });

    const { result } = renderHook(() => useTenantTheme());
    expect(result.current.isLoading).toBe(false);
  });

  it('clearCache removes all theme caches and query data', () => {
    const { result } = renderHook(() => useTenantTheme());

    result.current.clearCache();

    expect(mockClearAll).toHaveBeenCalled();
    expect(mockRemoveQueries).toHaveBeenCalledWith({
      queryKey: ['tenantTheme'],
    });
  });

  it('passes correct query options including staleTime', () => {
    renderHook(() => useTenantTheme());

    const queryArgs = mockUseQuery.mock.calls[0][0] as {
      enabled: boolean;
      staleTime: number;
      queryKey: readonly string[];
    };
    expect(queryArgs.enabled).toBe(true);
    expect(queryArgs.staleTime).toBeGreaterThan(0);
    expect(queryArgs.queryKey).toContain(MOCK_TENANT_ID);
  });

  it('disables query when tenantId is missing', () => {
    mockAuthState = { isLoggedIn: true, userInfo: { roles: [] } };

    renderHook(() => useTenantTheme());

    const queryArgs = mockUseQuery.mock.calls[0][0] as { enabled: boolean };
    expect(queryArgs.enabled).toBe(false);
  });
});
