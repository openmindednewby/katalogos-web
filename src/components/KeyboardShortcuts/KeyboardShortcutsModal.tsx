/**
 * Modal displaying all available keyboard shortcuts grouped by category.
 * Closes on Escape key or close button press.
 */
import React, { useMemo } from 'react';

import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { buildShortcutCategories } from './keyboardShortcutData';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { FM } from '../../localization/helpers';
import { MODAL_OVERLAY_COLOR } from '../../shared/constants';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';

import type { ShortcutCategory, ShortcutDisplayInfo } from './keyboardShortcutTypes';

const MODAL_MAX_WIDTH = 520;
const MODAL_PADDING = 24;
const BORDER_RADIUS = 12;
const KBD_BORDER_RADIUS = 4;
const KBD_PADDING_H = 8;
const KBD_PADDING_V = 3;
const KBD_BORDER_WIDTH = 1;
const SECTION_GAP = 20;
const ROW_GAP = 8;

interface Props {
  visible: boolean;
  onClose: () => void;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: MODAL_OVERLAY_COLOR,
    justifyContent: 'center', alignItems: 'center', padding: 20,
  },
  modal: {
    width: '100%', maxWidth: MODAL_MAX_WIDTH, maxHeight: '80%',
    borderRadius: BORDER_RADIUS, padding: MODAL_PADDING,
  },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: SECTION_GAP,
  },
  title: { fontSize: 20, fontWeight: 'bold' },
  closeBtn: { padding: ROW_GAP },
  closeBtnText: { fontSize: 16, fontWeight: '600' },
  section: { marginBottom: SECTION_GAP },
  sectionTitle: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', marginBottom: ROW_GAP },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  label: { fontSize: 14, flex: 1 },
  keysContainer: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  kbd: {
    borderRadius: KBD_BORDER_RADIUS, borderWidth: KBD_BORDER_WIDTH,
    paddingHorizontal: KBD_PADDING_H, paddingVertical: KBD_PADDING_V,
  },
  kbdText: { fontSize: 12, fontFamily: 'monospace' },
  orText: { fontSize: 12 },
});

const ShortcutRow: React.FC<{
  info: ShortcutDisplayInfo;
  textColor: string;
  borderColor: string;
  surfaceColor: string;
  textSecondary: string;
}> = ({ info, textColor, borderColor, surfaceColor, textSecondary }) => (
  <View style={styles.row} testID={TestIds.KEYBOARD_SHORTCUTS_SHORTCUT_ROW}>
    <Text style={[styles.label, { color: textColor }]}>{FM(info.labelKey)}</Text>
    <View style={styles.keysContainer}>
      {info.keyCombinations.map((combo, i) => (
        <React.Fragment key={combo}>
          {i > 0 ? <Text style={[styles.orText, { color: textSecondary }]}>{FM('keyboardShortcuts.or')}</Text> : null}
          <View style={[styles.kbd, { borderColor, backgroundColor: surfaceColor }]}>
            <Text style={[styles.kbdText, { color: textColor }]}>{combo}</Text>
          </View>
        </React.Fragment>
      ))}
    </View>
  </View>
);

const CategorySection: React.FC<{
  category: ShortcutCategory;
  textColor: string;
  borderColor: string;
  surfaceColor: string;
  textSecondary: string;
}> = ({ category, textColor, borderColor, surfaceColor, textSecondary }) => (
  <View style={styles.section} testID={TestIds.KEYBOARD_SHORTCUTS_CATEGORY}>
    <Text style={[styles.sectionTitle, { color: textSecondary }]}>{FM(category.titleKey)}</Text>
    {category.shortcuts.map((info) => (
      <ShortcutRow
        key={info.labelKey}
        borderColor={borderColor}
        info={info}
        surfaceColor={surfaceColor}
        textColor={textColor}
        textSecondary={textSecondary}
      />
    ))}
  </View>
);

const KeyboardShortcutsModal: React.FC<Props> = ({ visible, onClose }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary: string = theme.palette.primary['500'];

  useEscapeKey(onClose, visible);

  const categories = useMemo(() => buildShortcutCategories(), []);

  return (
    <Modal
      transparent
      animationType="fade"
      testID={TestIds.KEYBOARD_SHORTCUTS_MODAL}
      visible={visible}
      onRequestClose={onClose}
    >
      <View
        accessibilityHint={FM('keyboardShortcuts.modalHint')}
        accessibilityLabel={FM('keyboardShortcuts.modalLabel')}
        accessibilityRole="none"
        style={styles.overlay}
      >
        <View style={[styles.modal, { backgroundColor: colors.background }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>{FM('keyboardShortcuts.title')}</Text>
            <TouchableOpacity
              accessibilityHint={FM('keyboardShortcuts.closeHint')}
              accessibilityLabel={FM('keyboardShortcuts.close')}
              accessibilityRole="button"
              style={styles.closeBtn}
              testID={TestIds.KEYBOARD_SHORTCUTS_CLOSE_BUTTON}
              onPress={onClose}
            >
              <Text style={[styles.closeBtnText, { color: primary }]}>{FM('keyboardShortcuts.close')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            {categories.map((cat) => (
              <CategorySection
                key={cat.titleKey}
                borderColor={colors.border}
                category={cat}
                surfaceColor={colors.surface}
                textColor={colors.text}
                textSecondary={colors.textSecondary}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default KeyboardShortcutsModal;
