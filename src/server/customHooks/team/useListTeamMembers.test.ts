/**
 * Unit tests for useListTeamMembers hook.
 */
import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';

import { useListTeamMembers, getListTeamMembersQueryKey } from './useListTeamMembers';

import type { ListMembersResponse } from './teamTypes';

jest.mock('../../mutators/identityMutator', () => ({
  identityInstance: jest.fn(),
}));

const { identityInstance } = jest.requireMock('../../mutators/identityMutator');

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

describe('useListTeamMembers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns team members on success', async () => {
    const mockResponse: ListMembersResponse = {
      members: [
        { id: 1, externalId: 'ext-1', userId: 'user-1', role: 'Owner', invitedByUserId: 'user-0', joinedAt: '2026-01-01T00:00:00Z' },
        { id: 2, externalId: 'ext-2', userId: 'user-2', role: 'Staff', invitedByUserId: 'user-1', joinedAt: '2026-02-01T00:00:00Z' },
      ],
    };
    identityInstance.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useListTeamMembers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.members).toHaveLength(2);
    expect(result.current.data?.members[0].role).toBe('Owner');
  });

  it('returns error state on failure', async () => {
    identityInstance.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useListTeamMembers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('getListTeamMembersQueryKey returns stable key', () => {
    const key1 = getListTeamMembersQueryKey();
    const key2 = getListTeamMembersQueryKey();
    expect(key1).toEqual(key2);
    expect(key1).toEqual(['team', 'members']);
  });
});
