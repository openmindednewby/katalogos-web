/**
 * Tests for useMenuVersion hook.
 * Focuses on query key generation and enabled logic.
 */
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { getMenuVersionQueryKey, useMenuVersion } from './useMenuVersion';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;

const SAMPLE_MENU_ID = 'menu-abc-123';
const SAMPLE_VERSION_ID = 'version-xyz-456';

describe('useMenuVersion', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false });
  });

  it('disables query when menuId is empty', () => {
    renderHook(() => useMenuVersion('', SAMPLE_VERSION_ID));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('disables query when versionId is empty', () => {
    renderHook(() => useMenuVersion(SAMPLE_MENU_ID, ''));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('enables query when both IDs are valid strings', () => {
    renderHook(() => useMenuVersion(SAMPLE_MENU_ID, SAMPLE_VERSION_ID));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
  });

  it('uses the correct query key', () => {
    renderHook(() => useMenuVersion(SAMPLE_MENU_ID, SAMPLE_VERSION_ID));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['menu-version-detail', SAMPLE_MENU_ID, SAMPLE_VERSION_ID],
      }),
    );
  });
});

describe('getMenuVersionQueryKey', () => {
  it('returns a deterministic query key array', () => {
    expect(getMenuVersionQueryKey(SAMPLE_MENU_ID, SAMPLE_VERSION_ID)).toEqual([
      'menu-version-detail', SAMPLE_MENU_ID, SAMPLE_VERSION_ID,
    ]);
  });

  it('returns different keys for different version IDs', () => {
    const key1 = getMenuVersionQueryKey(SAMPLE_MENU_ID, 'v1');
    const key2 = getMenuVersionQueryKey(SAMPLE_MENU_ID, 'v2');
    expect(key1).not.toEqual(key2);
  });
});
