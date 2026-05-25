/**
 * Tests for useMenuSchedule hooks.
 * Focuses on mutation function construction and callback behavior.
 */
import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act, waitFor } from '@testing-library/react-native';

import { useSetMenuSchedule, useRemoveMenuSchedule } from './useMenuSchedule';
import ScheduledDays from '../../shared/enums/ScheduledDays';

import type { MenuSchedule } from '../../types/menuTypes';

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

const TEST_EXTERNAL_ID = 'test-menu-id';
const TEST_SCHEDULE: MenuSchedule = {
  scheduledDays: ScheduledDays.Weekdays,
  startTime: '11:00',
  endTime: '15:00',
  isEnabled: true,
  timeZoneId: 'America/New_York',
};

describe('useSetMenuSchedule', () => {
  beforeEach(() => {
    mockCustomInstance.mockReset();
  });

  it('calls customInstance with PUT method and correct URL', async () => {
    mockCustomInstance.mockResolvedValue(undefined);
    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useSetMenuSchedule({ onSuccess }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.mutate({
        externalId: TEST_EXTERNAL_ID,
        schedule: TEST_SCHEDULE,
      });
    });

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });

    expect(mockCustomInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `/api/v1/TenantMenus/${TEST_EXTERNAL_ID}/schedule`,
        method: 'PUT',
        data: expect.objectContaining({
          scheduledDays: ScheduledDays.Weekdays,
          startTime: '11:00',
          endTime: '15:00',
          isEnabled: true,
          timeZoneId: 'America/New_York',
        }),
      }),
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it('calls onError when mutation fails', async () => {
    const error = new Error('Network error');
    mockCustomInstance.mockRejectedValue(error);
    const onError = jest.fn();

    const { result } = renderHook(
      () => useSetMenuSchedule({ onError }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.mutate({
        externalId: TEST_EXTERNAL_ID,
        schedule: TEST_SCHEDULE,
      });
    });

    await waitFor(() => { expect(result.current.isError).toBe(true); });
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBe(error);
  });
});

describe('useRemoveMenuSchedule', () => {
  beforeEach(() => {
    mockCustomInstance.mockReset();
  });

  it('calls customInstance with DELETE method and correct URL', async () => {
    mockCustomInstance.mockResolvedValue(undefined);
    const onSuccess = jest.fn();

    const { result } = renderHook(
      () => useRemoveMenuSchedule({ onSuccess }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.mutate({ externalId: TEST_EXTERNAL_ID });
    });

    await waitFor(() => { expect(result.current.isSuccess).toBe(true); });

    expect(mockCustomInstance).toHaveBeenCalledWith(
      expect.objectContaining({
        url: `/api/v1/TenantMenus/${TEST_EXTERNAL_ID}/schedule`,
        method: 'DELETE',
      }),
    );
    expect(onSuccess).toHaveBeenCalled();
  });

  it('calls onError when mutation fails', async () => {
    const error = new Error('Network error');
    mockCustomInstance.mockRejectedValue(error);
    const onError = jest.fn();

    const { result } = renderHook(
      () => useRemoveMenuSchedule({ onError }),
      { wrapper: createWrapper() },
    );

    act(() => {
      result.current.mutate({ externalId: TEST_EXTERNAL_ID });
    });

    await waitFor(() => { expect(result.current.isError).toBe(true); });
    expect(onError).toHaveBeenCalled();
    expect(onError.mock.calls[0][0]).toBe(error);
  });
});
