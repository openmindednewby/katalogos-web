/**
 * Tests for useCreateExperiment hook.
 * Focuses on mutation function and callback behavior.
 */
import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react-native';

import { useCreateExperiment } from './useCreateExperiment';

import type { CreateExperimentRequest } from './types';

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

const TEST_REQUEST: CreateExperimentRequest = {
  name: 'Test Experiment',
  menuId: 'menu-1',
  variantBConfig: { themePreset: 'dark', menuVersionId: null },
};

const TEST_RESPONSE = { id: 'exp-1', name: 'Test Experiment', menuId: 'menu-1', menuName: 'My Menu', status: 'Draft', variantBConfig: TEST_REQUEST.variantBConfig, startedAt: null, stoppedAt: null, winner: null, createdAt: '2026-03-21' };

describe('useCreateExperiment', () => {
  beforeEach(() => {
    mockCustomInstance.mockReset();
  });

  it('calls customInstance with POST and correct URL', async () => {
    mockCustomInstance.mockResolvedValue(TEST_RESPONSE);
    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useCreateExperiment({ onSuccess }),
      { wrapper: createWrapper() },
    );

    act(() => { result.current.mutate(TEST_REQUEST); });

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });

    expect(mockCustomInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/v1/experiments',
        method: 'POST',
        data: TEST_REQUEST,
      }),
    );
    expect(onSuccess).toHaveBeenCalledWith(TEST_RESPONSE);
  });

  it('calls onError when mutation fails', async () => {
    const error = new Error('Network error');
    mockCustomInstance.mockRejectedValue(error);
    const onError = jest.fn();

    const { result } = renderHook(
      () => useCreateExperiment({ onError }),
      { wrapper: createWrapper() },
    );

    act(() => { result.current.mutate(TEST_REQUEST); });

    await waitFor(() => { expect(result.current.isError).toBe(true); });
    expect(onError).toHaveBeenCalled();
  });
});
