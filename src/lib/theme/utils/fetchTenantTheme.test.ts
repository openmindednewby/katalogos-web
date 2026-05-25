/**
 * Unit tests for fetchTenantTheme API function.
 *
 * Tests ETag support, 304 Not Modified handling, DTO transformation,
 * and error scenarios. Does NOT test rendering.
 */
import { fetchTenantTheme } from './fetchTenantTheme';

import type { AxiosResponse } from 'axios';

// -- Mocks -------------------------------------------------------------------

const MOCK_TENANT_ID = 'tenant-123';
const MOCK_ETAG = '"etag-abc"';

const mockRequest = jest.fn();

jest.mock('../../api/axiosInstance', () => ({
  apiClient: { request: (...args: unknown[]) => mockRequest(...args) },
}));

jest.mock('../../../config/environment', () => ({
  __esModule: true,
  default: { IDENTITY_API_URL: 'http://test-identity:5002' },
}));

jest.mock('../../../shared/utils/validators', () => ({
  isNotEmptyString: (value: unknown): value is string =>
    typeof value === 'string' && value.length > 0,
}));

jest.mock('../../../theme/presets', () => ({
  DEFAULT_THEME_CONFIG: {
    primary: '#000000',
    secondary: '#111111',
    accent: '#222222',
    semantic: { success: '#00ff00', warning: '#ffff00', error: '#ff0000', info: '#0000ff' },
    light: {
      background: '#ffffff',
      surface: '#f0f0f0',
      surfaceElevated: '#ffffff',
      text: '#000000',
      textSecondary: '#666666',
      border: '#cccccc',
      divider: '#cccccc',
    },
    dark: {
      background: '#000000',
      surface: '#111111',
      surfaceElevated: '#222222',
      text: '#ffffff',
      textSecondary: '#aaaaaa',
      border: '#333333',
      divider: '#333333',
    },
    branding: {
      logoContentId: null,
      faviconContentId: null,
      presetId: null,
    },
  },
}));

function createMockResponse(data: unknown, status: number, etag?: string): AxiosResponse {
  return {
    data,
    status,
    statusText: status === 200 ? 'OK' : 'Not Modified',
    headers: typeof etag === 'string' && etag.length > 0 ? { etag } : {},
    config: { headers: {} },
  } as unknown as AxiosResponse;
}

// -- Tests -------------------------------------------------------------------

describe('fetchTenantTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends GET request to correct Identity API URL', async () => {
    mockRequest.mockResolvedValue(createMockResponse({}, 200));

    await fetchTenantTheme(MOCK_TENANT_ID);

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `/api/tenants/${MOCK_TENANT_ID}/theme`,
        method: 'GET',
        baseURL: 'http://test-identity:5002',
      }),
    );
  });

  it('sends If-None-Match header when cachedEtag is provided', async () => {
    mockRequest.mockResolvedValue(createMockResponse({}, 200));

    await fetchTenantTheme(MOCK_TENANT_ID, { cachedEtag: MOCK_ETAG });

    const callArgs = mockRequest.mock.calls[0][0] as Record<string, unknown>;
    const headers = callArgs.headers as Record<string, string>;
    expect(headers['If-None-Match']).toBe(MOCK_ETAG);
  });

  it('does not send If-None-Match when no cachedEtag', async () => {
    mockRequest.mockResolvedValue(createMockResponse({}, 200));

    await fetchTenantTheme(MOCK_TENANT_ID);

    const callArgs = mockRequest.mock.calls[0][0] as Record<string, unknown>;
    const headers = callArgs.headers as Record<string, string>;
    expect(headers['If-None-Match']).toBeUndefined();
  });

  it('extracts ETag from response headers on 200', async () => {
    const dto = { presetId: 'ocean', colors: { primary: '#0077b6' } };
    mockRequest.mockResolvedValue(createMockResponse(dto, 200, '"new-etag"'));

    const result = await fetchTenantTheme(MOCK_TENANT_ID);

    expect(result.etag).toBe('"new-etag"');
    expect(result.notModified).toBe(false);
    expect(result.themeConfig).not.toBeNull();
  });

  it('returns notModified=true on 304 status', async () => {
    mockRequest.mockResolvedValue(createMockResponse(null, 304));

    const result = await fetchTenantTheme(MOCK_TENANT_ID, { cachedEtag: MOCK_ETAG });

    expect(result.notModified).toBe(true);
    expect(result.themeConfig).toBeNull();
    expect(result.etag).toBe(MOCK_ETAG);
  });

  it('transforms API DTO to TenantThemeConfig format', async () => {
    const dto = {
      presetId: 'ocean',
      colors: {
        primary: '#0077b6',
        secondary: '#90e0ef',
        primaryLight: '#48cae4',
        background: '#caf0f8',
        surface: '#e0f7fa',
        onBackground: '#023047',
        onSurface: '#264653',
      },
      darkColors: {
        background: '#001219',
        surface: '#005f73',
        onBackground: '#caf0f8',
        onSurface: '#90e0ef',
      },
      logoContentId: 'logo-abc',
      faviconContentId: null,
    };
    mockRequest.mockResolvedValue(createMockResponse(dto, 200, '"etag-xyz"'));

    const result = await fetchTenantTheme(MOCK_TENANT_ID);

    expect(result.themeConfig?.primary).toBe('#0077b6');
    expect(result.themeConfig?.secondary).toBe('#90e0ef');
    expect(result.themeConfig?.accent).toBe('#48cae4');
    expect(result.themeConfig?.light.background).toBe('#caf0f8');
    expect(result.themeConfig?.dark.background).toBe('#001219');
    expect(result.themeConfig?.branding.logoContentId).toBe('logo-abc');
    expect(result.themeConfig?.branding.presetId).toBe('ocean');
  });

  it('returns null config when API returns empty DTO', async () => {
    mockRequest.mockResolvedValue(createMockResponse({}, 200));

    const result = await fetchTenantTheme(MOCK_TENANT_ID);

    expect(result.themeConfig).toBeNull();
    expect(result.notModified).toBe(false);
  });

  it('handles 304 thrown as axios error', async () => {
    const axiosError = {
      response: { status: 304 },
      isAxiosError: true,
    };
    mockRequest.mockRejectedValue(axiosError);

    const result = await fetchTenantTheme(MOCK_TENANT_ID, { cachedEtag: MOCK_ETAG });

    expect(result.notModified).toBe(true);
    expect(result.etag).toBe(MOCK_ETAG);
  });

  it('rethrows non-304 errors', async () => {
    const networkError = new Error('Network failure');
    mockRequest.mockRejectedValue(networkError);

    await expect(fetchTenantTheme(MOCK_TENANT_ID)).rejects.toThrow('Network failure');
  });

  it('passes AbortSignal to the request', async () => {
    const controller = new AbortController();
    mockRequest.mockResolvedValue(createMockResponse({}, 200));

    await fetchTenantTheme(MOCK_TENANT_ID, { signal: controller.signal });

    const callArgs = mockRequest.mock.calls[0][0] as Record<string, unknown>;
    expect(callArgs.signal).toBe(controller.signal);
  });
});
