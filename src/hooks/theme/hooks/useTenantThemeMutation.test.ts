/**
 * Unit tests for useTenantThemeMutation hook.
 * Tests logic and callbacks, not rendering.
 */
import { renderHook, act } from '@testing-library/react-native';

import { useTenantThemeMutation } from './useTenantThemeMutation';

import type { TenantThemeConfig } from '@dloizides/tenant-theme-web';

// Mock queryClient module to prevent QueryCache constructor error
jest.mock('../../../lib/queryClient', () => ({
  queryKeys: {
    tenantTheme: {
      all: ['tenantTheme'],
      byTenant: (id: string) => ['tenantTheme', id],
    },
  },
}));

// Mock dependencies
jest.mock('react-redux', () => ({
  useSelector: jest.fn().mockReturnValue('test-tenant-id'),
}));

const mockInvalidateQueries = jest.fn().mockResolvedValue(undefined);
const mockMutate = jest.fn();

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
  }),
  useMutation: (opts: Record<string, unknown>) => {
    return {
      mutate: (config: TenantThemeConfig) => {
        mockMutate(config);
        const onSuccess = opts.onSuccess as (() => void) | undefined;
        if (typeof onSuccess === 'function') onSuccess();
      },
      isPending: false,
      isError: false,
      error: null,
    };
  },
}));

jest.mock('@dloizides/tenant-theme-web', () => ({
  saveTenantTheme: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock('../../../lib/theme/themeTransport', () => ({
  httpGet: jest.fn(),
  httpPut: jest.fn(),
  defaultThemeConfig: {},
  getIdentityBaseUrl: () => 'http://test-identity:5002',
}));

const mockConfig: TenantThemeConfig = {
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

describe('useTenantThemeMutation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return saveTheme function and initial state', () => {
    const { result } = renderHook(() => useTenantThemeMutation());

    expect(typeof result.current.saveTheme).toBe('function');
    expect(result.current.isPending).toBe(false);
    expect(result.current.isError).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should call mutate with the config when saveTheme is called', () => {
    const { result } = renderHook(() => useTenantThemeMutation());

    act(() => {
      result.current.saveTheme(mockConfig);
    });

    expect(mockMutate).toHaveBeenCalledWith(mockConfig);
  });

  it('should call onSuccess callback when mutation succeeds', () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() =>
      useTenantThemeMutation({ onSuccess }),
    );

    act(() => {
      result.current.saveTheme(mockConfig);
    });

    expect(onSuccess).toHaveBeenCalled();
  });

  it('should invalidate query cache on success', () => {
    const { result } = renderHook(() => useTenantThemeMutation());

    act(() => {
      result.current.saveTheme(mockConfig);
    });

    expect(mockInvalidateQueries).toHaveBeenCalled();
  });

  it('should call onError callback when onError fires', () => {
    const testError = new Error('Save failed');
    const onError = jest.fn();

    // Override useMutation to simulate error flow
    const useMutation = require('@tanstack/react-query').useMutation;
    const originalImpl = useMutation;
    require('@tanstack/react-query').useMutation = (opts: Record<string, unknown>) => {
      const result = originalImpl(opts);
      return {
        ...result,
        mutate: (config: TenantThemeConfig) => {
          mockMutate(config);
          const onErrorCb = opts.onError as ((error: Error) => void) | undefined;
          if (typeof onErrorCb === 'function') onErrorCb(testError);
        },
      };
    };

    const { result } = renderHook(() =>
      useTenantThemeMutation({ onError }),
    );

    act(() => {
      result.current.saveTheme(mockConfig);
    });

    expect(onError).toHaveBeenCalledWith(testError);

    // Restore
    require('@tanstack/react-query').useMutation = originalImpl;
  });
});
