/**
 * Unit tests for useInviteTeamMember hook.
 */
import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor, act } from '@testing-library/react-native';

import { useInviteTeamMember } from './useInviteTeamMember';

import type { TeamInvitationDto } from './teamTypes';

jest.mock('../../mutators/identityMutator', () => ({
  identityInstance: jest.fn(),
}));

const { identityInstance } = jest.requireMock('../../mutators/identityMutator');

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

describe('useInviteTeamMember', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls identity API with correct payload', async () => {
    const mockResponse: TeamInvitationDto = {
      id: 1, externalId: 'ext-1', email: 'test@example.com', role: 'Staff',
      status: 'Pending', invitedByUserId: 'user-1', invitedAt: '2026-01-01T00:00:00Z',
      acceptedAt: null, expiresAt: '2026-01-08T00:00:00Z',
    };
    identityInstance.mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useInviteTeamMember(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'test@example.com', role: 2 });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(identityInstance).toHaveBeenCalledWith(expect.objectContaining({
      url: '/api/v1/team/invite',
      method: 'POST',
      data: { email: 'test@example.com', role: 2 },
    }));
  });

  it('handles error state', async () => {
    identityInstance.mockRejectedValueOnce(new Error('Conflict'));

    const { result } = renderHook(() => useInviteTeamMember(), { wrapper: createWrapper() });

    act(() => {
      result.current.mutate({ email: 'test@example.com', role: 2 });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
