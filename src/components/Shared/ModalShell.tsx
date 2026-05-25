import React from 'react';

import { Modal, ScrollView, StyleSheet, TouchableOpacity, View, type StyleProp, type ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import Heading from './Heading';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';
import { SvgIcon } from '../Icons';

const styles = StyleSheet.create({
  scrollView: {
    padding: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  closeButton: {
    padding: 6,
    borderRadius: 6,
  },
});

interface Props {
  visible: boolean;
  onCancel: () => void;
  title?: string | React.ReactNode;
  children?: React.ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  showClose?: boolean;
}

const ModalShell = ({ visible, onCancel, title, children, contentStyle, showClose = true }: Props): React.ReactElement => {
  const { theme } = useTheme();

  const containerStyle = React.useMemo(
    () => [layoutStyles.container, styles.scrollView, { backgroundColor: theme.colors.background }, contentStyle],
    [theme.colors.background, contentStyle],
  );
  const closeA11yLabel = FM('quizTemplates.cancel');
  const accessibleTitle = typeof title === 'string' ? title : FM('common.dialog');

  return (
    <Modal
      animationType="slide"
      testID={TestIds.TEMPLATE_MODAL}
      visible={visible}
      onRequestClose={onCancel}
    >
      <ScrollView
        accessibilityViewIsModal
        aria-label={accessibleTitle}
        role="dialog"
        style={containerStyle}
      >
        <View style={styles.headerRow}>
          <Heading>{title ?? FM('close')}</Heading>
          {showClose ? (
            <TouchableOpacity
              accessibilityHint={FM('common.closeDialogHint')}
              accessibilityLabel={closeA11yLabel}
              accessibilityRole="button"
              style={styles.closeButton}
              testID={TestIds.CANCEL_BUTTON}
              onPress={onCancel}
            >
              <SvgIcon color={theme.colors.textSecondary} name="close" size={18} />
            </TouchableOpacity>
          ) : null}
        </View>

        {children}
      </ScrollView>
    </Modal>
  );
};

export default ModalShell;
