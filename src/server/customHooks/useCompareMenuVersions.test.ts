/**
 * Tests for useCompareMenuVersions hook.
 * Focuses on query key generation and enabled logic.
 */
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { getCompareMenuVersionsQueryKey, useCompareMenuVersions } from './useCompareMenuVersions';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;

const SAMPLE_MENU_ID = 'menu-abc-123';
const SAMPLE_V1 = 'version-1';
const SAMPLE_V2 = 'version-2';

describe('useCompareMenuVersions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false });
  });

  it('disables query when menuId is empty', () => {
    renderHook(() => useCompareMenuVersions('', SAMPLE_V1, SAMPLE_V2));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('disables query when versionId1 is empty', () => {
    renderHook(() => useCompareMenuVersions(SAMPLE_MENU_ID, '', SAMPLE_V2));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('disables query when versionId2 is empty', () => {
    renderHook(() => useCompareMenuVersions(SAMPLE_MENU_ID, SAMPLE_V1, ''));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('enables query when all IDs are valid', () => {
    renderHook(() => useCompareMenuVersions(SAMPLE_MENU_ID, SAMPLE_V1, SAMPLE_V2));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
  });

  it('uses the correct query key', () => {
    renderHook(() => useCompareMenuVersions(SAMPLE_MENU_ID, SAMPLE_V1, SAMPLE_V2));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['menu-version-compare', SAMPLE_MENU_ID, SAMPLE_V1, SAMPLE_V2],
      }),
    );
  });
});

describe('getCompareMenuVersionsQueryKey', () => {
  it('returns a deterministic query key array', () => {
    expect(getCompareMenuVersionsQueryKey(SAMPLE_MENU_ID, SAMPLE_V1, SAMPLE_V2)).toEqual([
      'menu-version-compare', SAMPLE_MENU_ID, SAMPLE_V1, SAMPLE_V2,
    ]);
  });

  it('returns different keys for different version combinations', () => {
    const key1 = getCompareMenuVersionsQueryKey(SAMPLE_MENU_ID, 'v1', 'v2');
    const key2 = getCompareMenuVersionsQueryKey(SAMPLE_MENU_ID, 'v1', 'v3');
    expect(key1).not.toEqual(key2);
  });
});
