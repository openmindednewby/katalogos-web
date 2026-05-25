/**
 * Privacy Policy modal.
 *
 * Displays placeholder legal text for the privacy policy in a full-screen modal.
 * Content is clearly marked as a template to be reviewed by legal counsel.
 */
import React from 'react';

import { Modal, StyleSheet, View, Text, ScrollView, TouchableOpacity } from 'react-native';

import { FM } from '@/localization/helpers';

import LegalSection from './components/LegalSection';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { SvgIcon } from '../Icons';

const CONTENT_PADDING = 16;
const BOTTOM_PADDING = 48;
const TITLE_FONT_SIZE = 24;
const TITLE_MARGIN_BOTTOM = 4;
const UPDATED_FONT_SIZE = 12;
const UPDATED_MARGIN_BOTTOM = 16;
const CLOSE_BUTTON_PADDING = 6;
const CLOSE_BUTTON_BORDER_RADIUS = 6;
const CLOSE_ICON_SIZE = 18;

const PLACEHOLDER_DATE = '2026-03-12';

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: CONTENT_PADDING, paddingBottom: BOTTOM_PADDING },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: '700', marginBottom: TITLE_MARGIN_BOTTOM },
  lastUpdated: { fontSize: UPDATED_FONT_SIZE, marginBottom: UPDATED_MARGIN_BOTTOM },
  closeButton: {
    padding: CLOSE_BUTTON_PADDING,
    borderRadius: CLOSE_BUTTON_BORDER_RADIUS,
  },
});

const SECTIONS = [
  'introduction',
  'dataWeCollect',
  'howWeUse',
  'legalBasis',
  'dataSharing',
  'internationalTransfers',
  'dataRetention',
  'yourRights',
  'cookies',
  'childrenPrivacy',
  'dataSecurity',
  'policyChanges',
  'contact',
] as const;

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal = ({ visible, onClose }: PrivacyPolicyModalProps): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.background }]} testID={TestIds.PRIVACY_POLICY_SCREEN}>
        <ScrollView
          accessibilityViewIsModal
          aria-label={FM('legal.privacyPolicy.title')}
          contentContainerStyle={styles.scrollContent}
          role="dialog"
        >
          <View style={styles.headerRow}>
            <Text style={[styles.title, { color: colors.text }]}>
              {FM('legal.privacyPolicy.title')}
            </Text>
            <TouchableOpacity
              accessibilityHint={FM('common.closeDialogHint')}
              accessibilityLabel={FM('common.close')}
              accessibilityRole="button"
              style={styles.closeButton}
              testID={TestIds.PRIVACY_POLICY_CLOSE}
              onPress={onClose}
            >
              <SvgIcon color={colors.textSecondary} name="close" size={CLOSE_ICON_SIZE} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.lastUpdated, { color: colors.textSecondary }]}>
            {FM('legal.privacyPolicy.lastUpdated', PLACEHOLDER_DATE)}
          </Text>

          {SECTIONS.map((key) => (
            <LegalSection
              key={key}
              body={FM(`legal.privacyPolicy.${key}.body`)}
              title={FM(`legal.privacyPolicy.${key}.title`)}
            />
          ))}
        </ScrollView>
      </View>
    </Modal>
  );
};
