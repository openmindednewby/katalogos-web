/**
 * Renders a single team member row with role badge and action buttons.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FD, FM } from '../../../../localization/helpers';
import { isOwnerRole, teamRoleToLabelKey, teamRoleToSemanticColor } from '../../../../shared/enums/TeamRole';
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

import type { TeamMemberDto } from '../../../../server/customHooks/team/teamTypes';

interface Props {
  member: TeamMemberDto;
  isAdmin: boolean;
  onRemove: (member: TeamMemberDto) => void;
  onChangeRole: (member: TeamMemberDto) => void;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ROW_PADDING_VERTICAL,
    borderBottomWidth: BORDER_WIDTH,
  },
  info: { flex: 1 },
  userId: { fontSize: EMAIL_FONT_SIZE, fontWeight: '500' },
  meta: { flexDirection: 'row', alignItems: 'center', marginTop: META_MARGIN_TOP, gap: ACTION_BUTTON_GAP },
  badge: {
    paddingHorizontal: BADGE_PADDING_HORIZONTAL,
    paddingVertical: BADGE_PADDING_VERTICAL,
    borderRadius: BADGE_BORDER_RADIUS,
  },
  badgeText: { fontSize: SECONDARY_FONT_SIZE, fontWeight: BADGE_FONT_WEIGHT },
  dateText: { fontSize: SECONDARY_FONT_SIZE },
  actions: { flexDirection: 'row', gap: ACTION_BUTTON_GAP },
  actionButton: {
    paddingHorizontal: BADGE_PADDING_HORIZONTAL,
    paddingVertical: BADGE_PADDING_VERTICAL,
    borderRadius: BADGE_BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
  },
  actionText: { fontSize: SECONDARY_FONT_SIZE, fontWeight: '500' },
});

const TeamMemberRow = ({ member, isAdmin, onRemove, onChangeRole }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  const roleLabel = FM(teamRoleToLabelKey(member.role));
  const semanticColor = teamRoleToSemanticColor(member.role);
  const badgeScale = theme.semantic[semanticColor];
  const badgeBg = badgeScale['100'];
  const badgeFg = badgeScale['700'];

  const joinedDate = useMemo(() => {
    const date = new Date(member.joinedAt);
    return FD(date);
  }, [member.joinedAt]);

  const isOwner = isOwnerRole(member.role);

  return (
    <View style={[styles.row, { borderBottomColor: colors.border }]} testID={TestIds.TEAM_MEMBER_ROW}>
      <View style={styles.info}>
        <Text style={[styles.userId, { color: colors.text }]}>{member.userId}</Text>
        <View style={styles.meta}>
          <View
            style={[styles.badge, { backgroundColor: badgeBg }]}
            testID={TestIds.TEAM_MEMBER_ROLE_BADGE}
          >
            <Text style={[styles.badgeText, { color: badgeFg }]}>{roleLabel}</Text>
          </View>
          <Text style={[styles.dateText, { color: colors.textSecondary }]}>
            {FM('settings.team.joinedAt', joinedDate)}
          </Text>
        </View>
      </View>

      {isAdmin && !isOwner ? (
        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityHint={FM('settings.team.changeRoleHint')}
            accessibilityLabel={FM('settings.team.changeRole')}
            accessibilityRole="button"
            style={[styles.actionButton, { borderColor: colors.border }]}
            testID={TestIds.TEAM_MEMBER_ROLE_SELECT}
            onPress={() => onChangeRole(member)}
          >
            <Text style={[styles.actionText, { color: colors.text }]}>
              {FM('settings.team.changeRole')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityHint={FM('settings.team.removeMemberHint')}
            accessibilityLabel={FM('settings.team.removeMember')}
            accessibilityRole="button"
            style={[styles.actionButton, { borderColor: theme.semantic.error['500'] }]}
            testID={TestIds.TEAM_MEMBER_REMOVE_BUTTON}
            onPress={() => onRemove(member)}
          >
            <Text style={[styles.actionText, { color: theme.semantic.error['500'] }]}>
              {FM('settings.team.removeMember')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default TeamMemberRow;
