/**
 * Tests for useRecordExperimentView hook.
 * Focuses on mutation function construction.
 */
import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react-native';

import { useRecordExperimentView } from './useRecordExperimentView';

const mockCustomInstance = jest.fn();
jest.mock('@/server/mutators/onlineMenuMutator', () => ({
  customInstance: (...args: unknown[]) => mockCustomInstance(...args),
}));

function createWrapper(): React.FC<{ children: React.ReactNode }> {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);

  return Wrapper;
}

const TEST_EXPERIMENT_ID = 'exp-view-1';
const TEST_VARIANT = 'A';

describe('useRecordExperimentView', () => {
  beforeEach(() => {
    mockCustomInstance.mockReset();
  });

  it('calls customInstance with POST and correct URL and body', async () => {
    mockCustomInstance.mockResolvedValue(undefined);

    const { result } = renderHook(
      () => useRecordExperimentView(),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.mutate({
        experimentId: TEST_EXPERIMENT_ID,
        variant: TEST_VARIANT,
      });
    });

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });

    expect(mockCustomInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `/api/v1/experiments/${TEST_EXPERIMENT_ID}/view`,
        method: 'POST',
        data: { variant: TEST_VARIANT },
      }),
    );
  });

  it('handles failure gracefully', async () => {
    mockCustomInstance.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(
      () => useRecordExperimentView(),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.mutate({
        experimentId: TEST_EXPERIMENT_ID,
        variant: TEST_VARIANT,
      });
    });

    await waitFor(() => { expect(result.current.isError).toBe(true); });
  });
});
