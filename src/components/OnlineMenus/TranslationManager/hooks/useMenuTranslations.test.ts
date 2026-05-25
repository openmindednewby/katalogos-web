/**
 * Tests for useMenuTranslations hook.
 * Focuses on logic: mutation callbacks, notification messages, and query key construction.
 */
import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react-native';

import { useMenuTranslations } from './useMenuTranslations';

import type { TranslatedMenuContents } from '../../../../types/menuTypes';

// Mock the HTTP client
const mockCustomInstance = jest.fn();
jest.mock('../../../../server/mutators/onlineMenuMutator', () => ({
  customInstance: (...args: unknown[]) => mockCustomInstance(...args),
}));

// Mock notifications
const mockNotify = jest.fn();
jest.mock('../../../../lib/notifications', () => ({
  notify: (...args: unknown[]) => mockNotify(...args),
}));

// Mock FM
jest.mock('@/localization/helpers', () => ({
  FM: (key: string) => key,
}));

// Mock isValueDefined
jest.mock('../../../../utils/is', () => ({
  isValueDefined: (val: unknown) => val !== null && val !== undefined,
}));

function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
}

describe('useMenuTranslations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns empty translations when menuExternalId is undefined', () => {
    const { result } = renderHook(() => useMenuTranslations(undefined), {
      wrapper: createWrapper(),
    });

    expect(result.current.translations).toEqual([]);
    expect(result.current.isLoading).toBe(false);
  });

  it('calls the translate endpoint with language codes', async () => {
    mockCustomInstance.mockResolvedValueOnce({ translations: [] });
    mockCustomInstance.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useMenuTranslations('menu-123'), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.translateMenu(['es', 'fr']);
    });

    await waitFor(() => {
      expect(mockCustomInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/TenantMenus/menu-123/translations/translate',
          method: 'POST',
          data: { languageCodes: ['es', 'fr'] },
        }),
      );
    });
  });

  it('notifies success after successful translation', async () => {
    mockCustomInstance.mockResolvedValueOnce({ translations: [] });
    mockCustomInstance.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useMenuTranslations('menu-123'), {
      wrapper: createWrapper(),
    });

    act(() => { result.current.translateMenu(['es']); });

    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith('success', 'translations.translateSuccess');
    });
  });

  it('notifies error after failed translation', async () => {
    mockCustomInstance.mockResolvedValueOnce({ translations: [] });
    mockCustomInstance.mockRejectedValueOnce(new Error('API error'));

    const { result } = renderHook(() => useMenuTranslations('menu-123'), {
      wrapper: createWrapper(),
    });

    act(() => { result.current.translateMenu(['es']); });

    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith('error', 'translations.translateError');
    });
  });

  it('calls the delete endpoint with language code', async () => {
    mockCustomInstance.mockResolvedValueOnce({ translations: [] });
    mockCustomInstance.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useMenuTranslations('menu-123'), {
      wrapper: createWrapper(),
    });

    act(() => { result.current.deleteTranslation('es'); });

    await waitFor(() => {
      expect(mockCustomInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/TenantMenus/menu-123/translations/es',
          method: 'DELETE',
        }),
      );
    });
  });

  it('calls the update endpoint with contents', async () => {
    mockCustomInstance.mockResolvedValueOnce({ translations: [] });
    mockCustomInstance.mockResolvedValueOnce(undefined);

    const contents: TranslatedMenuContents = {
      menuName: 'Menu Traducido',
      categories: [],
    };

    const { result } = renderHook(() => useMenuTranslations('menu-123'), {
      wrapper: createWrapper(),
    });

    act(() => { result.current.updateTranslationContents('es', contents); });

    await waitFor(() => {
      expect(mockCustomInstance).toHaveBeenCalledWith(
        expect.objectContaining({
          url: '/TenantMenus/menu-123/translations/es',
          method: 'PUT',
          data: contents,
        }),
      );
    });
  });

  it('notifies success after successful delete', async () => {
    mockCustomInstance.mockResolvedValueOnce({ translations: [] });
    mockCustomInstance.mockResolvedValueOnce(undefined);

    const { result } = renderHook(() => useMenuTranslations('menu-123'), {
      wrapper: createWrapper(),
    });

    act(() => { result.current.deleteTranslation('fr'); });

    await waitFor(() => {
      expect(mockNotify).toHaveBeenCalledWith('success', 'translations.deleteSuccess');
    });
  });
});
