/**
 * Confirm dialogs for team management actions (remove, revoke, role change).
 */
import React from 'react';

import { FM } from '../../../../localization/helpers';
import { isManagerRole } from '../../../../shared/enums/TeamRole';
import { isValueDefined } from '../../../../utils/is';
import ConfirmDialog from '../../../Shared/ConfirmDialog';

import type { TeamActions } from '../hooks/useTeamActions';

interface Props {
  actions: TeamActions;
}

const TeamConfirmDialogs = ({ actions }: Props): React.ReactElement => {
  const newRoleLabel = isManagerRole(actions.changingRoleMember?.role ?? '')
    ? FM('settings.team.roleStaff')
    : FM('settings.team.roleManager');

  return (
    <>
      <ConfirmDialog
        destructive
        loading={actions.removePending}
        message={FM('settings.team.confirmRemoveMessage', actions.removingMember?.userId ?? '')}
        title={FM('settings.team.confirmRemoveTitle')}
        visible={isValueDefined(actions.removingMember)}
        onCancel={() => actions.setRemovingMember(null)}
        onConfirm={actions.handleRemoveConfirm}
      />

      <ConfirmDialog
        destructive
        loading={actions.revokePending}
        message={FM('settings.team.confirmRevokeMessage', actions.revokingInvitation?.email ?? '')}
        title={FM('settings.team.confirmRevokeTitle')}
        visible={isValueDefined(actions.revokingInvitation)}
        onCancel={() => actions.setRevokingInvitation(null)}
        onConfirm={actions.handleRevokeConfirm}
      />

      <ConfirmDialog
        loading={actions.roleUpdatePending}
        message={FM('settings.team.confirmRoleChangeMessage', newRoleLabel)}
        title={FM('settings.team.confirmRoleChangeTitle')}
        visible={isValueDefined(actions.changingRoleMember)}
        onCancel={() => actions.setChangingRoleMember(null)}
        onConfirm={actions.handleRoleChangeConfirm}
      />
    </>
  );
};

export default TeamConfirmDialogs;
