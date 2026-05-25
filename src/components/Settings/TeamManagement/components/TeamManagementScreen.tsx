/**
 * Team Management Screen.
 * Displays team members and pending invitations with admin controls.
 */
import React from 'react';

import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';

import { useSelector } from 'react-redux';

import InviteTeamMemberModal from './InviteTeamMemberModal';
import PendingInvitationRow from './PendingInvitationRow';
import TeamConfirmDialogs from './TeamConfirmDialogs';
import TeamMemberRow from './TeamMemberRow';
import { KeycloakRoles } from '../../../../auth/keycloakTypes';
import { FM } from '../../../../localization/helpers';
import { useListTeamInvitations } from '../../../../server/customHooks/team/useListTeamInvitations';
import { useListTeamMembers } from '../../../../server/customHooks/team/useListTeamMembers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { Button } from '../../../core/Button';
import ButtonVariant from '../../../core/Button/utils/ButtonVariant';
import Breadcrumb from '../../../Shared/Breadcrumb';
import Heading from '../../../Shared/Heading';
import Section from '../../../Shared/Section';
import { SECTION_SPACING, BODY_FONT_SIZE, ERROR_TEXT_MARGIN_TOP, TITLE_FONT_SIZE } from '../../constants';
import { useTeamActions } from '../hooks/useTeamActions';

import type { RootState } from '../../../../store/reduxStore';

const SECTION_HEADING_WEIGHT = '600' as const;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SECTION_SPACING },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: BODY_FONT_SIZE, textAlign: 'center', marginTop: ERROR_TEXT_MARGIN_TOP },
  sectionTitle: { fontSize: TITLE_FONT_SIZE, fontWeight: SECTION_HEADING_WEIGHT, marginBottom: SECTION_SPACING },
  emptyText: { fontSize: BODY_FONT_SIZE, textAlign: 'center', paddingVertical: SECTION_SPACING },
  inviteRow: { marginBottom: SECTION_SPACING },
  sectionSpacing: { marginTop: SECTION_SPACING },
});

const TeamManagementScreen = (): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];

  const userInfo = useSelector((s: RootState) => s.auth.userInfo);
  const isAdmin = userInfo?.roles.includes(KeycloakRoles.Admin) ?? false;

  const { data: membersData, isLoading: membersLoading, isError: membersError } = useListTeamMembers();
  const { data: invitationsData, isLoading: invitationsLoading } = useListTeamInvitations();
  const actions = useTeamActions();

  const members = membersData?.members ?? [];
  const invitations = invitationsData?.invitations ?? [];
  const isLoading = membersLoading || invitationsLoading;

  if (isLoading)
    return (
      <View style={styles.loadingContainer} testID={TestIds.TEAM_LOADING}>
        <ActivityIndicator color={primary} size="large" />
        <Text style={[styles.errorText, { color: colors.textSecondary }]}>{FM('loading')}</Text>
      </View>
    );

  if (membersError)
    return (
      <View style={styles.loadingContainer} testID={TestIds.TEAM_ERROR}>
        <Text style={[styles.errorText, { color: errorColor }]}>{FM('settings.team.messages.loadError')}</Text>
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID={TestIds.TEAM_SCREEN}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Breadcrumb />
        <Heading>{FM('settings.team.title')}</Heading>

        {isAdmin ? (
          <View style={styles.inviteRow}>
            <Button
              accessibilityHint={FM('settings.team.inviteMemberHint')}
              accessibilityLabel={FM('settings.team.inviteMember')}
              label={FM('settings.team.inviteMember')}
              testID={TestIds.TEAM_INVITE_BUTTON}
              variant={ButtonVariant.Primary}
              onPress={actions.openInviteModal}
            />
          </View>
        ) : null}

        <Section>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>{FM('settings.team.membersSection')}</Text>
          {members.length === 0 ? (
            <Text style={[styles.emptyText, { color: colors.textSecondary }]} testID={TestIds.TEAM_EMPTY_MEMBERS}>
              {FM('settings.team.noMembers')}
            </Text>
          ) : (
            <View testID={TestIds.TEAM_MEMBERS_SECTION}>
              {members.map((m) => (
                <TeamMemberRow
                  key={m.id}
                  isAdmin={isAdmin}
                  member={m}
                  onChangeRole={actions.setChangingRoleMember}
                  onRemove={actions.setRemovingMember}
                />
              ))}
            </View>
          )}
        </Section>

        <View style={styles.sectionSpacing}>
          <Section>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {FM('settings.team.invitationsSection')}
            </Text>
            {invitations.length === 0 ? (
              <Text style={[styles.emptyText, { color: colors.textSecondary }]} testID={TestIds.TEAM_EMPTY_INVITATIONS}>
                {FM('settings.team.noInvitations')}
              </Text>
            ) : (
              <View testID={TestIds.TEAM_INVITATIONS_SECTION}>
                {invitations.map((inv) => (
                  <PendingInvitationRow
                    key={inv.id}
                    invitation={inv}
                    isAdmin={isAdmin}
                    onRevoke={actions.setRevokingInvitation}
                  />
                ))}
              </View>
            )}
          </Section>
        </View>
      </ScrollView>

      <InviteTeamMemberModal
        loading={actions.invitePending}
        visible={actions.inviteModalVisible}
        onClose={actions.closeInviteModal}
        onSubmit={actions.handleInviteSubmit}
      />

      <TeamConfirmDialogs actions={actions} />
    </View>
  );
};

export default TeamManagementScreen;
