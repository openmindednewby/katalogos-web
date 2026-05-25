/**
 * Hook encapsulating team management mutation actions and modal state.
 */
import { useCallback, useState } from 'react';

import { useTeamMutations } from './useTeamMutations';
import TeamRole, { isManagerRole } from '../../../../shared/enums/TeamRole';

import type { TeamMemberDto, TeamInvitationDto } from '../../../../server/customHooks/team/teamTypes';

export interface TeamActions {
  inviteModalVisible: boolean;
  removingMember: TeamMemberDto | null;
  revokingInvitation: TeamInvitationDto | null;
  changingRoleMember: TeamMemberDto | null;
  invitePending: boolean;
  removePending: boolean;
  revokePending: boolean;
  roleUpdatePending: boolean;
  openInviteModal: () => void;
  closeInviteModal: () => void;
  handleInviteSubmit: (email: string, role: number) => void;
  setRemovingMember: (m: TeamMemberDto | null) => void;
  setRevokingInvitation: (i: TeamInvitationDto | null) => void;
  setChangingRoleMember: (m: TeamMemberDto | null) => void;
  handleRemoveConfirm: () => void;
  handleRevokeConfirm: () => void;
  handleRoleChangeConfirm: () => void;
}

function getToggleRole(currentRole: string): number {
  return isManagerRole(currentRole) ? TeamRole.Staff : TeamRole.Manager;
}

export function useTeamActions(): TeamActions {
  const m = useTeamMutations();
  const [inviteModalVisible, setInviteModalVisible] = useState(false);
  const [removingMember, setRemovingMember] = useState<TeamMemberDto | null>(null);
  const [revokingInvitation, setRevokingInvitation] = useState<TeamInvitationDto | null>(null);
  const [changingRoleMember, setChangingRoleMember] = useState<TeamMemberDto | null>(null);

  const handleInviteSubmit = useCallback(
    (email: string, role: number) => m.invite(email, role, () => setInviteModalVisible(false)), [m]);
  const handleRemoveConfirm = useCallback(() => {
    if (removingMember) m.remove(removingMember.id, () => setRemovingMember(null));
  }, [removingMember, m]);
  const handleRevokeConfirm = useCallback(() => {
    if (revokingInvitation) m.revoke(revokingInvitation.id, () => setRevokingInvitation(null));
  }, [revokingInvitation, m]);
  const handleRoleChangeConfirm = useCallback(() => {
    if (!changingRoleMember) return;
    m.updateRole(changingRoleMember.id, getToggleRole(changingRoleMember.role), () => setChangingRoleMember(null));
  }, [changingRoleMember, m]);

  return {
    inviteModalVisible, removingMember, revokingInvitation, changingRoleMember,
    ...m,
    openInviteModal: () => setInviteModalVisible(true),
    closeInviteModal: () => setInviteModalVisible(false),
    handleInviteSubmit, setRemovingMember, setRevokingInvitation, setChangingRoleMember,
    handleRemoveConfirm, handleRevokeConfirm, handleRoleChangeConfirm,
  };
}
