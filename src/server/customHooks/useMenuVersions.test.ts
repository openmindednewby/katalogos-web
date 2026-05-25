/**
 * Tests for useMenuVersions hook.
 * Focuses on query key generation and enabled logic.
 */
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { getMenuVersionsQueryKey, useMenuVersions } from './useMenuVersions';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;

const SAMPLE_MENU_ID = 'menu-abc-123';
const SAMPLE_PAGE = 1;
const SAMPLE_PAGE_SIZE = 10;

describe('useMenuVersions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false });
  });

  it('disables query when menuId is empty', () => {
    renderHook(() => useMenuVersions('', SAMPLE_PAGE, SAMPLE_PAGE_SIZE));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('enables query when menuId is a valid string', () => {
    renderHook(() => useMenuVersions(SAMPLE_MENU_ID, SAMPLE_PAGE, SAMPLE_PAGE_SIZE));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
  });

  it('uses the correct query key', () => {
    renderHook(() => useMenuVersions(SAMPLE_MENU_ID, SAMPLE_PAGE, SAMPLE_PAGE_SIZE));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['menu-versions', SAMPLE_MENU_ID, '1', '10'],
      }),
    );
  });
});

describe('getMenuVersionsQueryKey', () => {
  it('returns a deterministic query key array', () => {
    expect(getMenuVersionsQueryKey(SAMPLE_MENU_ID, SAMPLE_PAGE, SAMPLE_PAGE_SIZE)).toEqual([
      'menu-versions', SAMPLE_MENU_ID, '1', '10',
    ]);
  });

  it('returns different keys for different pages', () => {
    const key1 = getMenuVersionsQueryKey(SAMPLE_MENU_ID, 1, SAMPLE_PAGE_SIZE);
    const key2 = getMenuVersionsQueryKey(SAMPLE_MENU_ID, 2, SAMPLE_PAGE_SIZE);
    expect(key1).not.toEqual(key2);
  });

  it('returns different keys for different menu IDs', () => {
    const key1 = getMenuVersionsQueryKey('menu-1', SAMPLE_PAGE, SAMPLE_PAGE_SIZE);
    const key2 = getMenuVersionsQueryKey('menu-2', SAMPLE_PAGE, SAMPLE_PAGE_SIZE);
    expect(key1).not.toEqual(key2);
  });
});
