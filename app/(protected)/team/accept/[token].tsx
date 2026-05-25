/**
 * Accept Team Invitation route page.
 * Allows authenticated users to accept a team invitation via token.
 */
import React, { useCallback } from 'react';

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { useLocalSearchParams, useRouter } from 'expo-router';

import { Button } from '../../../../src/components/core/Button';
import ButtonVariant from '../../../../src/components/core/Button/utils/ButtonVariant';
import { notifyError, notifySuccess } from '../../../../src/lib/notifications';
import { FM } from '../../../../src/localization/helpers';
import { Routes } from '../../../../src/navigation/routes';
import { useAcceptInvitation } from '../../../../src/server/customHooks/team/useAcceptInvitation';
import { TestIds } from '../../../../src/shared/testIds';
import { useTheme } from '../../../../src/theme/hooks/useTheme';

const CONTAINER_PADDING = 24;
const TITLE_FONT_SIZE = 24;
const TITLE_FONT_WEIGHT = '700' as const;
const BODY_FONT_SIZE = 16;
const SPACING = 16;
const MAX_WIDTH = 480;
const SUCCESS_FONT_SIZE = 18;
const SUCCESS_FONT_WEIGHT = '600' as const;

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: CONTAINER_PADDING },
  card: { width: '100%', maxWidth: MAX_WIDTH, alignItems: 'center' },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: TITLE_FONT_WEIGHT, marginBottom: SPACING, textAlign: 'center' },
  description: { fontSize: BODY_FONT_SIZE, marginBottom: SPACING, textAlign: 'center' },
  buttonSpacing: { marginTop: SPACING, width: '100%' },
  successTitle: { fontSize: SUCCESS_FONT_SIZE, fontWeight: SUCCESS_FONT_WEIGHT, marginBottom: SPACING, textAlign: 'center' },
});

const AcceptInvitationPage = (): React.ReactElement => {
  const params = useLocalSearchParams<{ token: string }>();
  const token = String(params.token);
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme;

  const acceptMutation = useAcceptInvitation();

  const handleAccept = useCallback(() => {
    acceptMutation.mutate(token, {
      onSuccess: () => {
        notifySuccess(FM('settings.team.accept.successMessage'));
        router.replace(Routes.DASHBOARD);
      },
      onError: () => {
        notifyError(FM('settings.team.accept.errorGeneric'));
      },
    });
  }, [token, acceptMutation, router]);

  if (acceptMutation.isSuccess)
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]} testID={TestIds.TEAM_ACCEPT_SUCCESS}>
        <View style={styles.card}>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            {FM('settings.team.accept.successTitle')}
          </Text>
          <Text style={[styles.description, { color: colors.textSecondary }]}>
            {FM('settings.team.accept.successMessage')}
          </Text>
        </View>
      </View>
    );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]} testID={TestIds.TEAM_ACCEPT_SCREEN}>
      <View style={styles.card}>
        <Text style={[styles.title, { color: colors.text }]}>{FM('settings.team.accept.title')}</Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {FM('settings.team.accept.description')}
        </Text>

        {acceptMutation.isError ? (
          <Text
            style={[styles.description, { color: theme.semantic.error['500'] }]}
            testID={TestIds.TEAM_ACCEPT_ERROR}
          >
            {FM('settings.team.accept.errorGeneric')}
          </Text>
        ) : null}

        <View style={styles.buttonSpacing}>
          {acceptMutation.isPending ? (
            <View testID={TestIds.TEAM_ACCEPT_LOADING}>
              <ActivityIndicator color={theme.palette.primary['500']} size="large" />
            </View>
          ) : (
            <Button
              fullWidth
              accessibilityHint={FM('settings.team.accept.acceptButtonHint')}
              accessibilityLabel={FM('settings.team.accept.acceptButton')}
              label={FM('settings.team.accept.acceptButton')}
              testID={TestIds.TEAM_ACCEPT_BUTTON}
              variant={ButtonVariant.Primary}
              onPress={handleAccept}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default AcceptInvitationPage;
