/**
 * Tests for useGetExperiment hook.
 * Focuses on enabled logic and query key construction.
 */
import { useQuery } from '@tanstack/react-query';
import { renderHook } from '@testing-library/react-native';

import { getExperimentQueryKey, useGetExperiment } from './useGetExperiment';

jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQuery: jest.fn(),
}));

const mockUseQuery = useQuery as jest.Mock;

const SAMPLE_ID = 'exp-abc-123';

describe('useGetExperiment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseQuery.mockReturnValue({ data: undefined, isLoading: false });
  });

  it('disables query when experimentId is empty', () => {
    renderHook(() => useGetExperiment(''));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: false }),
    );
  });

  it('enables query when experimentId is valid', () => {
    renderHook(() => useGetExperiment(SAMPLE_ID));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({ enabled: true }),
    );
  });

  it('passes correct query key', () => {
    renderHook(() => useGetExperiment(SAMPLE_ID));

    expect(mockUseQuery).toHaveBeenCalledWith(
      expect.objectContaining({
        queryKey: ['experiment-detail', SAMPLE_ID],
      }),
    );
  });
});

describe('getExperimentQueryKey', () => {
  it('returns deterministic key array', () => {
    expect(getExperimentQueryKey(SAMPLE_ID)).toEqual([
      'experiment-detail', SAMPLE_ID,
    ]);
  });

  it('returns different keys for different ids', () => {
    const key1 = getExperimentQueryKey('exp-1');
    const key2 = getExperimentQueryKey('exp-2');
    expect(key1).not.toEqual(key2);
  });
});
