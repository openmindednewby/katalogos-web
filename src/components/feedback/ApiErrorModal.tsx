/**
 * Modal component for displaying API error events.
 *
 * Renders different content based on the modalComponent type:
 * - ErrorModal: generic error dialog
 * - MaintenanceModal: system under maintenance
 * - UpgradePrompt: feature gate / plan upgrade
 * - FeatureGateModal: feature not available
 */

import React, { useMemo } from 'react';

import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { FM } from '@/localization/helpers';

import { MODAL_OVERLAY_COLOR } from '../../shared/constants';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';

import type { ModalEvent } from '../../lib/api/events/apiEventTypes';

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  dialog: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 12,
    padding: 24,
    elevation: 5,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
  button: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

interface Props {
  event: ModalEvent | null;
  onDismiss: () => void;
}

function resolveTitle(modalComponent: string): string {
  switch (modalComponent) {
    case 'MaintenanceModal':
      return FM('errors.maintenanceMode');
    case 'UpgradePrompt':
      return FM('errors.upgradePrompt');
    case 'FeatureGateModal':
      return FM('errors.featureNotAvailable');
    default:
      return FM('common.error');
  }
}

const ApiErrorModal = ({ event, onDismiss }: Props): React.ReactElement | null => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];

  const colorStyles = useMemo(
    () => ({
      dialog: { backgroundColor: colors.background },
      title: { color: colors.text },
      message: { color: colors.textSecondary },
      button: { backgroundColor: primary },
      buttonText: { color: colors.background },
    }),
    [colors.background, colors.text, colors.textSecondary, primary],
  );

  if (!isValueDefined(event)) return null;

  const title = resolveTitle(event.modalComponent);
  const closeLabel = FM('errors.modalClose');

  return (
    <Modal
      transparent
      visible
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay} testID={TestIds.API_ERROR_MODAL}>
        <View
          accessibilityViewIsModal
          aria-label={title}
          role="dialog"
          style={[styles.dialog, colorStyles.dialog]}
        >
          <Text
            style={[styles.title, colorStyles.title]}
            testID={TestIds.API_ERROR_MODAL_TITLE}
          >
            {title}
          </Text>
          <Text
            style={[styles.message, colorStyles.message]}
            testID={TestIds.API_ERROR_MODAL_MESSAGE}
          >
            {event.message}
          </Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              accessibilityHint={FM('errors.modalDismiss')}
              accessibilityLabel={closeLabel}
              accessibilityRole="button"
              style={[styles.button, colorStyles.button]}
              testID={TestIds.API_ERROR_MODAL_CLOSE}
              onPress={onDismiss}
            >
              <Text style={colorStyles.buttonText}>{closeLabel}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ApiErrorModal;
