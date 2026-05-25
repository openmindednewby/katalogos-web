/**
 * Unit tests for useLogoUrl hook.
 *
 * Tests logo content ID extraction and URL resolution logic.
 * Does NOT test rendering.
 */
import { renderHook } from '@testing-library/react-native';

import { useLogoUrl } from './useLogoUrl';

import type { TenantThemeConfig } from '../../../theme/types';

// -- Mocks -------------------------------------------------------------------

const mockUsePublicContentUrl = jest.fn();

jest.mock('../../../lib/hooks/content/hooks/useContent', () => ({
  usePublicContentUrl: (...args: unknown[]) => mockUsePublicContentUrl(...args),
}));

const BASE_CONFIG: TenantThemeConfig = {
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

// -- Tests -------------------------------------------------------------------

describe('useLogoUrl', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUsePublicContentUrl.mockReturnValue({
      data: undefined,
      isLoading: false,
    });
  });

  it('returns null logoUrl when config is null', () => {
    const { result } = renderHook(() => useLogoUrl(null));

    expect(result.current.logoUrl).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockUsePublicContentUrl).toHaveBeenCalledWith(undefined);
  });

  it('returns null logoUrl when logoContentId is null', () => {
    const { result } = renderHook(() => useLogoUrl(BASE_CONFIG));

    expect(result.current.logoUrl).toBeNull();
    expect(mockUsePublicContentUrl).toHaveBeenCalledWith(undefined);
  });

  it('passes logoContentId to usePublicContentUrl when present', () => {
    const configWithLogo = {
      ...BASE_CONFIG,
      branding: { ...BASE_CONFIG.branding, logoContentId: 'logo-abc' },
    };

    renderHook(() => useLogoUrl(configWithLogo));

    expect(mockUsePublicContentUrl).toHaveBeenCalledWith('logo-abc');
  });

  it('returns resolved URL when content service responds', () => {
    const configWithLogo = {
      ...BASE_CONFIG,
      branding: { ...BASE_CONFIG.branding, logoContentId: 'logo-abc' },
    };
    mockUsePublicContentUrl.mockReturnValue({
      data: { url: 'https://cdn.example.com/logo.png', expiresAt: '2026-04-01T00:00:00Z' },
      isLoading: false,
    });

    const { result } = renderHook(() => useLogoUrl(configWithLogo));

    expect(result.current.logoUrl).toBe('https://cdn.example.com/logo.png');
    expect(result.current.isLoading).toBe(false);
  });

  it('reports isLoading when contentId exists and query is loading', () => {
    const configWithLogo = {
      ...BASE_CONFIG,
      branding: { ...BASE_CONFIG.branding, logoContentId: 'logo-abc' },
    };
    mockUsePublicContentUrl.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => useLogoUrl(configWithLogo));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.logoUrl).toBeNull();
  });

  it('does not report isLoading when no logoContentId', () => {
    mockUsePublicContentUrl.mockReturnValue({
      data: undefined,
      isLoading: true,
    });

    const { result } = renderHook(() => useLogoUrl(BASE_CONFIG));

    expect(result.current.isLoading).toBe(false);
  });

  it('returns null logoUrl when content URL response is empty', () => {
    const configWithLogo = {
      ...BASE_CONFIG,
      branding: { ...BASE_CONFIG.branding, logoContentId: 'logo-abc' },
    };
    mockUsePublicContentUrl.mockReturnValue({
      data: { url: '', expiresAt: '' },
      isLoading: false,
    });

    const { result } = renderHook(() => useLogoUrl(configWithLogo));

    expect(result.current.logoUrl).toBeNull();
  });
});
