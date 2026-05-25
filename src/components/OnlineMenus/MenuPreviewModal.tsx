/**
 * Modal for previewing a menu's live appearance.
 */
import React from 'react';

import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { MODAL_OVERLAY_COLOR } from '@/shared/constants';

import MenuLivePreview from './MenuLivePreview';
import { TestIds } from '../../shared/testIds';


import type { MenuContents } from '../../types/menuTypes';

const styles = StyleSheet.create({
  previewOverlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  previewModalContent: {
    width: '100%',
    maxWidth: 1200,
    maxHeight: '90%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  previewCloseButton: {
    padding: 8,
    borderRadius: 6,
  },
  previewCloseText: {
    fontSize: 16,
    fontWeight: '600',
  },
  previewBody: {
    flex: 1,
    minHeight: 400,
  },
});

interface PreviewItem {
  name?: string;
  description?: string | null;
  contents?: MenuContents | null;
}

interface ThemeColors {
  surface: string;
  border: string;
  text: string;
}

interface Props {
  visible: boolean;
  item: PreviewItem | null;
  colors: ThemeColors;
  onClose: () => void;
}

export const MenuPreviewModal = ({
  visible,
  item,
  colors,
  onClose,
}: Props): React.ReactElement => {
  const previewTitle = item?.name ?? FM('onlineMenus.preview');

  return (
    <Modal
      transparent
      animationType="fade"
      testID={TestIds.MENU_PREVIEW_MODAL}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.previewOverlay}>
        <View
          accessibilityViewIsModal
          aria-label={previewTitle}
          role="dialog"
          style={[styles.previewModalContent, { backgroundColor: colors.surface }]}
        >
          <View style={[styles.previewHeader, { borderBottomColor: colors.border }]}>
            <Text style={[styles.previewTitle, { color: colors.text }]}>
              {previewTitle}
            </Text>
            <TouchableOpacity
              accessibilityHint={FM('onlineMenus.closePreviewHint')}
              accessibilityLabel={FM('common.cancel')}
              accessibilityRole="button"
              style={[styles.previewCloseButton, { backgroundColor: colors.border }]}
              testID={TestIds.CANCEL_BUTTON}
              onPress={onClose}
            >
              <Text style={[styles.previewCloseText, { color: colors.text }]}>
                {FM('common.cancel')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.previewBody}>
            <MenuLivePreview
              contents={item?.contents ?? null}
              menuDescription={item?.description ?? undefined}
              menuName={item?.name ?? undefined}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};
