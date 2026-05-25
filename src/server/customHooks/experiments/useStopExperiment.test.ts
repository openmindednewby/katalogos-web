/**
 * Tests for useStopExperiment hook.
 * Focuses on mutation function and callback behavior.
 */
import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react-native';

import { useStopExperiment } from './useStopExperiment';

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

const TEST_EXPERIMENT_ID = 'exp-stop-1';

describe('useStopExperiment', () => {
  beforeEach(() => {
    mockCustomInstance.mockReset();
  });

  it('calls customInstance with POST and correct URL', async () => {
    mockCustomInstance.mockResolvedValue({ id: TEST_EXPERIMENT_ID, status: 'Completed' });
    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useStopExperiment({ onSuccess }),
      { wrapper: createWrapper() },
    );

    act(() => { result.current.mutate({ experimentId: TEST_EXPERIMENT_ID }); });

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });

    expect(mockCustomInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `/api/v1/experiments/${TEST_EXPERIMENT_ID}/stop`,
        method: 'POST',
      }),
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it('calls onError when mutation fails', async () => {
    const error = new Error('Server error');
    mockCustomInstance.mockRejectedValue(error);
    const onError = jest.fn();

    const { result } = renderHook(
      () => useStopExperiment({ onError }),
      { wrapper: createWrapper() },
    );

    act(() => { result.current.mutate({ experimentId: TEST_EXPERIMENT_ID }); });

    await waitFor(() => { expect(result.current.isError).toBe(true); });
    expect(onError).toHaveBeenCalled();
  });
});
