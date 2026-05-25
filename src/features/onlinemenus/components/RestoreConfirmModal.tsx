/**
 * Confirmation modal for restoring a menu version.
 */
import React from 'react';

import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';

import {
  MODAL_OVERLAY_COLOR, MODAL_WIDTH, MODAL_RADIUS, MODAL_PADDING,
  TITLE_FONT_SIZE, TITLE_MARGIN_BOTTOM, SUMMARY_FONT_SIZE,
  MODAL_MESSAGE_MARGIN_BOTTOM, MODAL_BUTTONS_GAP,
  BUTTON_RADIUS, ACTION_BUTTON_PADDING_V, ACTION_BUTTON_PADDING_H,
} from './versioningConstants';

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: MODAL_OVERLAY_COLOR, justifyContent: 'center', alignItems: 'center' },
  modal: { width: MODAL_WIDTH, borderRadius: MODAL_RADIUS, padding: MODAL_PADDING },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: 'bold', marginBottom: TITLE_MARGIN_BOTTOM },
  message: { fontSize: SUMMARY_FONT_SIZE, marginBottom: MODAL_MESSAGE_MARGIN_BOTTOM },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: MODAL_BUTTONS_GAP },
  button: { paddingVertical: ACTION_BUTTON_PADDING_V, paddingHorizontal: ACTION_BUTTON_PADDING_H, borderRadius: BUTTON_RADIUS },
});

interface Props {
  visible: boolean;
  versionNumber: number;
  textColor: string;
  borderColor: string;
  primaryColor: string;
  backgroundColor: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const RestoreConfirmModal: React.FC<Props> = ({
  visible, versionNumber, textColor, borderColor, primaryColor, backgroundColor, onConfirm, onCancel,
}) => (
  <Modal transparent animationType="fade" testID={TestIds.VERSION_RESTORE_CONFIRM_MODAL} visible={visible} onRequestClose={onCancel}>
    <View style={styles.overlay}>
      <View style={[styles.modal, { backgroundColor }]}>
        <Text style={[styles.title, { color: textColor }]}>
          {FM('onlineMenus.versioning.restoreConfirmTitle')}
        </Text>
        <Text style={[styles.message, { color: textColor }]}>
          {FM('onlineMenus.versioning.restoreConfirmMessage', String(versionNumber))}
        </Text>
        <View style={styles.buttons}>
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.versioning.restoreCancelHint')}
            accessibilityLabel={FM('onlineMenus.versioning.restoreCancel')}
            accessibilityRole="button"
            style={[styles.button, { backgroundColor: borderColor }]}
            testID={TestIds.VERSION_RESTORE_CANCEL_BUTTON}
            onPress={onCancel}
          >
            <Text style={{ color: textColor }}>{FM('onlineMenus.versioning.restoreCancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.versioning.restoreConfirmHint')}
            accessibilityLabel={FM('onlineMenus.versioning.restoreConfirm')}
            accessibilityRole="button"
            style={[styles.button, { backgroundColor: primaryColor }]}
            testID={TestIds.VERSION_RESTORE_CONFIRM_BUTTON}
            onPress={onConfirm}
          >
            <Text style={{ color: backgroundColor }}>{FM('onlineMenus.versioning.restoreConfirm')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default RestoreConfirmModal;
