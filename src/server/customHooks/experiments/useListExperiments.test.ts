/**
 * Tests for useListExperiments hook.
 * Focuses on query key generation and query configuration.
 */
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { getListExperimentsQueryKey, useListExperiments } from './useListExperiments';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;

const SAMPLE_PAGE = 1;
const SAMPLE_PAGE_SIZE = 10;

describe('useListExperiments', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false });
  });

  it('passes correct query key', () => {
    renderHook(() => useListExperiments(SAMPLE_PAGE, SAMPLE_PAGE_SIZE));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['experiments-list', '1', '10'],
      }),
    );
  });

  it('provides a queryFn', () => {
    renderHook(() => useListExperiments(SAMPLE_PAGE, SAMPLE_PAGE_SIZE));

    const callArgs = mockUseQuery.mock.calls[0][0];
    expect(callArgs.queryFn).toBeDefined();
  });
});

describe('getListExperimentsQueryKey', () => {
  it('returns deterministic key array', () => {
    expect(getListExperimentsQueryKey(SAMPLE_PAGE, SAMPLE_PAGE_SIZE)).toEqual([
      'experiments-list', '1', '10',
    ]);
  });

  it('returns different keys for different pages', () => {
    const key1 = getListExperimentsQueryKey(1, SAMPLE_PAGE_SIZE);
    const key2 = getListExperimentsQueryKey(2, SAMPLE_PAGE_SIZE);
    expect(key1).not.toEqual(key2);
  });
});
