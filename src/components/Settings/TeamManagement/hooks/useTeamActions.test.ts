/**
 * Unit tests for useTeamActions hook.
 * Focuses on testing callback logic and state transitions.
 */
import React from 'react';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, act } from '@testing-library/react-native';

import { useTeamActions } from './useTeamActions';

import type { TeamMemberDto, TeamInvitationDto } from '../../../../server/customHooks/team/teamTypes';

jest.mock('../../../../lib/notifications', () => ({
  notifySuccess: jest.fn(),
  notifyError: jest.fn(),
}));

jest.mock('../../../../server/customHooks/team/useInviteTeamMember', () => ({
  useInviteTeamMember: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

jest.mock('../../../../server/customHooks/team/useRemoveMember', () => ({
  useRemoveMember: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

jest.mock('../../../../server/customHooks/team/useRevokeInvitation', () => ({
  useRevokeInvitation: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

jest.mock('../../../../server/customHooks/team/useUpdateMemberRole', () => ({
  useUpdateMemberRole: jest.fn(() => ({ mutate: jest.fn(), isPending: false })),
}));

jest.mock('../../../../localization/helpers', () => ({
  FM: (key: string) => key,
}));

const createWrapper = (): React.FC<{ children: React.ReactNode }> => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }): React.ReactElement =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  return Wrapper;
};

describe('useTeamActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('opens and closes invite modal', () => {
    const { result } = renderHook(() => useTeamActions(), { wrapper: createWrapper() });

    expect(result.current.inviteModalVisible).toBe(false);

    act(() => { result.current.openInviteModal(); });
    expect(result.current.inviteModalVisible).toBe(true);

    act(() => { result.current.closeInviteModal(); });
    expect(result.current.inviteModalVisible).toBe(false);
  });

  it('sets removing member state', () => {
    const member: TeamMemberDto = {
      id: 1, externalId: 'ext-1', userId: 'user-1', role: 'Staff',
      invitedByUserId: 'user-0', joinedAt: '2026-01-01T00:00:00Z',
    };

    const { result } = renderHook(() => useTeamActions(), { wrapper: createWrapper() });

    expect(result.current.removingMember).toBeNull();

    act(() => { result.current.setRemovingMember(member); });
    expect(result.current.removingMember).toEqual(member);

    act(() => { result.current.setRemovingMember(null); });
    expect(result.current.removingMember).toBeNull();
  });

  it('sets revoking invitation state', () => {
    const invitation: TeamInvitationDto = {
      id: 1, externalId: 'ext-1', email: 'test@example.com', role: 'Staff',
      status: 'Pending', invitedByUserId: 'user-0', invitedAt: '2026-01-01T00:00:00Z',
      acceptedAt: null, expiresAt: null,
    };

    const { result } = renderHook(() => useTeamActions(), { wrapper: createWrapper() });

    act(() => { result.current.setRevokingInvitation(invitation); });
    expect(result.current.revokingInvitation).toEqual(invitation);
  });

  it('sets changing role member state', () => {
    const member: TeamMemberDto = {
      id: 2, externalId: 'ext-2', userId: 'user-2', role: 'Manager',
      invitedByUserId: 'user-0', joinedAt: '2026-01-01T00:00:00Z',
    };

    const { result } = renderHook(() => useTeamActions(), { wrapper: createWrapper() });

    act(() => { result.current.setChangingRoleMember(member); });
    expect(result.current.changingRoleMember).toEqual(member);
  });
});
