/**
 * Renders a single pending invitation row with status badge and revoke button.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FD, FM } from '../../../../localization/helpers';
import { isAcceptedStatus, isPendingStatus } from '../../../../shared/enums/InvitationStatus';
import { teamRoleToLabelKey } from '../../../../shared/enums/TeamRole';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import {
  ROW_PADDING_VERTICAL,
  EMAIL_FONT_SIZE,
  SECONDARY_FONT_SIZE,
  ACTION_BUTTON_GAP,
  BADGE_BORDER_RADIUS,
  BADGE_PADDING_HORIZONTAL,
  BADGE_PADDING_VERTICAL,
  BADGE_FONT_WEIGHT,
  BORDER_WIDTH,
  META_MARGIN_TOP,
} from '../constants';

import type { TeamInvitationDto } from '../../../../server/customHooks/team/teamTypes';
import type { ResolvedSemanticColors } from '../../../../theme/types/resolvedTheme';

interface Props {
  invitation: TeamInvitationDto;
  isAdmin: boolean;
  onRevoke: (invitation: TeamInvitationDto) => void;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ROW_PADDING_VERTICAL,
    borderBottomWidth: BORDER_WIDTH,
  },
  info: { flex: 1 },
  email: { fontSize: EMAIL_FONT_SIZE, fontWeight: '500' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: META_MARGIN_TOP, gap: ACTION_BUTTON_GAP },
  badge: {
    paddingHorizontal: BADGE_PADDING_HORIZONTAL,
    paddingVertical: BADGE_PADDING_VERTICAL,
    borderRadius: BADGE_BORDER_RADIUS,
  },
  badgeText: { fontSize: SECONDARY_FONT_SIZE, fontWeight: BADGE_FONT_WEIGHT },
  dateText: { fontSize: SECONDARY_FONT_SIZE },
  actionButton: {
    paddingHorizontal: BADGE_PADDING_HORIZONTAL,
    paddingVertical: BADGE_PADDING_VERTICAL,
    borderRadius: BADGE_BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
  },
  actionText: { fontSize: SECONDARY_FONT_SIZE, fontWeight: '500' },
});

function getStatusLabelKey(status: string): string {
  if (isPendingStatus(status)) return 'settings.team.statusPending';
  if (isAcceptedStatus(status)) return 'settings.team.statusAccepted';
  return 'settings.team.statusExpired';
}

function getStatusSemanticKey(status: string): keyof ResolvedSemanticColors {
  if (isPendingStatus(status)) return 'warning';
  if (isAcceptedStatus(status)) return 'success';
  return 'error';
}

const PendingInvitationRow = ({ invitation, isAdmin, onRevoke }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  const statusLabel = FM(getStatusLabelKey(invitation.status));
  const statusScale = theme.semantic[getStatusSemanticKey(invitation.status)];
  const statusBg = statusScale['100'];
  const statusFg = statusScale['700'];

  const roleLabel = FM(teamRoleToLabelKey(invitation.role));

  const invitedDate = useMemo(() => {
    const date = new Date(invitation.invitedAt);
    return FD(date);
  }, [invitation.invitedAt]);

  const isPending = isPendingStatus(invitation.status);

  return (
    <View
      style={[styles.row, { borderBottomColor: colors.border }]}
      testID={TestIds.TEAM_INVITATION_ROW}
    >
      <View style={styles.info}>
        <Text style={[styles.email, { color: colors.text }]}>{invitation.email}</Text>
        <View style={styles.meta}>
          <View
            style={[styles.badge, { backgroundColor: statusBg }]}
            testID={TestIds.TEAM_INVITATION_STATUS_BADGE}
          >
            <Text style={[styles.badgeText, { color: statusFg }]}>{statusLabel}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>{roleLabel}</Text>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {FM('settings.team.invitedAt', invitedDate)}
          </Text>
        </View>
      </View>

      {isAdmin && isPending ? (
        <TouchableOpacity
          accessibilityHint={FM('settings.team.revokeInvitationHint')}
          accessibilityLabel={FM('settings.team.revokeInvitation')}
          accessibilityRole="button"
          style={[styles.actionButton, { borderColor: theme.semantic.error['500'] }]}
          testID={TestIds.TEAM_INVITATION_REVOKE_BUTTON}
          onPress={() => onRevoke(invitation)}
        >
          <Text style={[styles.actionText, { color: theme.semantic.error['500'] }]}>
            {FM('settings.team.revokeInvitation')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default PendingInvitationRow;
