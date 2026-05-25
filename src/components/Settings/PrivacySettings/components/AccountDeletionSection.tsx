/**
 * Account Deletion section.
 * Allows users to request account deletion with a grace period,
 * and cancel a pending deletion request.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { StyleSheet, Text, View } from 'react-native';

import DeletionRequestForm from './DeletionRequestForm';
import {
  useRequestDeletion,
  useCancelDeletion,
  DeletionStatus,
  DELETION_GRACE_PERIOD_DAYS,
} from '../../../../lib/hooks/privacy';
import { notifyError, notifySuccess } from '../../../../lib/notifications';
import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { Button, ButtonVariant } from '../../../core/Button';
import Section from '../../../Shared/Section';
import {
  TITLE_FONT_SIZE,
  TITLE_GAP,
  DESCRIPTION_FONT_SIZE,
  MEDIUM_SPACING,
  BODY_FONT_SIZE,
  FINE_PRINT_FONT_SIZE,
  SMALL_SPACING,
} from '../constants';

import type { DeletionRequest } from '../../../../lib/hooks/privacy';

const TITLE_FONT_WEIGHT = '600' as const;

const styles = StyleSheet.create({
  sectionTitle: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: TITLE_FONT_WEIGHT,
    marginBottom: TITLE_GAP,
  },
  sectionDescription: {
    fontSize: DESCRIPTION_FONT_SIZE,
    marginBottom: MEDIUM_SPACING,
  },
  statusText: {
    fontSize: BODY_FONT_SIZE,
    marginBottom: MEDIUM_SPACING,
    fontStyle: 'italic',
  },
  gracePeriodText: {
    fontSize: FINE_PRINT_FONT_SIZE,
    marginBottom: SMALL_SPACING,
  },
  buttonSpacing: {
    marginTop: SMALL_SPACING,
  },
});

/** Translation key map for deletion statuses. */
const STATUS_TRANSLATION_KEYS: Record<string, string | undefined> = {
  [DeletionStatus.PendingConfirmation]: 'settings.privacy.deletion.status.pendingConfirmation',
  [DeletionStatus.Confirmed]: 'settings.privacy.deletion.status.confirmed',
  [DeletionStatus.Processing]: 'settings.privacy.deletion.status.processing',
  [DeletionStatus.Completed]: 'settings.privacy.deletion.status.completed',
  [DeletionStatus.Cancelled]: 'settings.privacy.deletion.status.cancelled',
};

function getStatusKey(status: DeletionStatus): string {
  return STATUS_TRANSLATION_KEYS[status] ?? 'settings.privacy.deletion.status.pendingConfirmation';
}

function isCancellable(status: DeletionStatus): boolean {
  return status === DeletionStatus.PendingConfirmation || status === DeletionStatus.Confirmed;
}

const AccountDeletionSection = (): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const errorColor = theme.semantic.error['500'];

  const [activeDeletion, setActiveDeletion] = useState<DeletionRequest | undefined>(undefined);

  const handleRequestSuccess = useCallback(
    (data: DeletionRequest) => {
      setActiveDeletion(data);
      notifySuccess(FM('settings.privacy.deletion.messages.requestSuccess'));
    },
    [],
  );

  const handleRequestError = useCallback(
    (_error: Error) => {
      notifyError(FM('settings.privacy.deletion.messages.requestError'));
    },
    [],
  );

  const requestCallbacks = useMemo(
    () => ({ onSuccess: handleRequestSuccess, onError: handleRequestError }),
    [handleRequestSuccess, handleRequestError],
  );

  const { requestDeletion, isPending: isRequesting } = useRequestDeletion(requestCallbacks);

  const handleCancelSuccess = useCallback(() => {
    setActiveDeletion(undefined);
    notifySuccess(FM('settings.privacy.deletion.messages.cancelSuccess'));
  }, []);

  const handleCancelError = useCallback(
    (_error: Error) => {
      notifyError(FM('settings.privacy.deletion.messages.cancelError'));
    },
    [],
  );

  const cancelCallbacks = useMemo(
    () => ({ onSuccess: handleCancelSuccess, onError: handleCancelError }),
    [handleCancelSuccess, handleCancelError],
  );

  const { cancelDeletion, isPending: isCancelling } = useCancelDeletion(
    activeDeletion?.requestId,
    cancelCallbacks,
  );

  const currentStatus = activeDeletion?.status;
  const hasActiveRequest = typeof currentStatus === 'string';
  const canCancel = hasActiveRequest && isCancellable(currentStatus);
  const gracePeriodText = FM('settings.privacy.deletion.gracePeriodInfo', String(DELETION_GRACE_PERIOD_DAYS));
  const descriptionText = FM('settings.privacy.deletion.description', String(DELETION_GRACE_PERIOD_DAYS));

  return (
    <Section>
      <View testID={TestIds.ACCOUNT_DELETION_SECTION}>
        <Text style={[styles.sectionTitle, { color: errorColor }]}>
          {FM('settings.privacy.deletion.title')}
        </Text>
        <Text style={[styles.sectionDescription, { color: colors.textSecondary }]}>
          {descriptionText}
        </Text>

        {hasActiveRequest ? (
          <>
            <Text
              style={[styles.statusText, { color: colors.textSecondary }]}
              testID={TestIds.ACCOUNT_DELETION_STATUS}
            >
              {FM(getStatusKey(currentStatus))}
            </Text>
            {canCancel ? (
              <Text style={[styles.gracePeriodText, { color: colors.textSecondary }]}>
                {gracePeriodText}
              </Text>
            ) : null}
          </>
        ) : null}

        {!hasActiveRequest ? (
          <DeletionRequestForm isRequesting={isRequesting} onRequest={requestDeletion} />
        ) : null}

        {canCancel ? (
          <View style={styles.buttonSpacing}>
            <Button
              accessibilityHint={FM('settings.privacy.deletion.cancelButton')}
              accessibilityLabel={FM('settings.privacy.deletion.cancelButton')}
              disabled={isCancelling}
              label={FM('settings.privacy.deletion.cancelButton')}
              loading={isCancelling}
              testID={TestIds.ACCOUNT_DELETION_CANCEL_BUTTON}
              variant={ButtonVariant.Secondary}
              onPress={cancelDeletion}
            />
          </View>
        ) : null}
      </View>
    </Section>
  );
};

export default AccountDeletionSection;
