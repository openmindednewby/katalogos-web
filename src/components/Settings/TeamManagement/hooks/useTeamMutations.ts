/**
 * Hook wrapping team mutation hooks with notification callbacks.
 */
import { useCallback } from 'react';

import { notifyError, notifySuccess } from '../../../../lib/notifications';
import { FM } from '../../../../localization/helpers';
import { useInviteTeamMember } from '../../../../server/customHooks/team/useInviteTeamMember';
import { useRemoveMember } from '../../../../server/customHooks/team/useRemoveMember';
import { useRevokeInvitation } from '../../../../server/customHooks/team/useRevokeInvitation';
import { useUpdateMemberRole } from '../../../../server/customHooks/team/useUpdateMemberRole';

interface TeamMutations {
  invite: (email: string, role: number, onDone: () => void) => void;
  remove: (memberId: number, onDone: () => void) => void;
  revoke: (invitationId: number, onDone: () => void) => void;
  updateRole: (memberId: number, newRole: number, onDone: () => void) => void;
  invitePending: boolean;
  removePending: boolean;
  revokePending: boolean;
  roleUpdatePending: boolean;
}

function successThen(key: string, onDone: () => void): () => void {
  return () => { notifySuccess(FM(key)); onDone(); };
}

function errorNotify(key: string): () => void {
  return () => { notifyError(FM(key)); };
}

function useInviteAction(mut: ReturnType<typeof useInviteTeamMember>): TeamMutations['invite'] {
  return useCallback((email: string, role: number, onDone: () => void) => {
    mut.mutate({ email, role }, {
      onSuccess: successThen('settings.team.messages.inviteSuccess', onDone),
      onError: errorNotify('settings.team.messages.inviteError'),
    });
  }, [mut]);
}

function useRemoveAction(mut: ReturnType<typeof useRemoveMember>): TeamMutations['remove'] {
  return useCallback((memberId: number, onDone: () => void) => {
    mut.mutate(memberId, {
      onSuccess: successThen('settings.team.messages.removeSuccess', onDone),
      onError: errorNotify('settings.team.messages.removeError'),
    });
  }, [mut]);
}

function useRevokeAction(mut: ReturnType<typeof useRevokeInvitation>): TeamMutations['revoke'] {
  return useCallback((invitationId: number, onDone: () => void) => {
    mut.mutate(invitationId, {
      onSuccess: successThen('settings.team.messages.revokeSuccess', onDone),
      onError: errorNotify('settings.team.messages.revokeError'),
    });
  }, [mut]);
}

function useRoleAction(mut: ReturnType<typeof useUpdateMemberRole>): TeamMutations['updateRole'] {
  return useCallback((memberId: number, newRole: number, onDone: () => void) => {
    mut.mutate({ memberId, data: { newRole } }, {
      onSuccess: successThen('settings.team.messages.roleUpdateSuccess', onDone),
      onError: errorNotify('settings.team.messages.roleUpdateError'),
    });
  }, [mut]);
}

export function useTeamMutations(): TeamMutations {
  const inviteMut = useInviteTeamMember();
  const removeMut = useRemoveMember();
  const revokeMut = useRevokeInvitation();
  const updateRoleMut = useUpdateMemberRole();

  return {
    invite: useInviteAction(inviteMut),
    remove: useRemoveAction(removeMut),
    revoke: useRevokeAction(revokeMut),
    updateRole: useRoleAction(updateRoleMut),
    invitePending: inviteMut.isPending,
    removePending: removeMut.isPending,
    revokePending: revokeMut.isPending,
    roleUpdatePending: updateRoleMut.isPending,
  };
}
