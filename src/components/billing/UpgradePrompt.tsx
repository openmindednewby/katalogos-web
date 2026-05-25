/**
 * UpgradePrompt - reusable component shown when a user tries to access a gated feature.
 * Can be used inline or as a modal overlay.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { FM } from '../../localization/helpers';
import { Routes } from '../../navigation/routes';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';

interface Props {
  /** The plan name required to access the feature. */
  requiredPlan: string;
  /** The user's current plan name. */
  currentPlan: string;
  /** Optional callback when the prompt is dismissed. */
  onDismiss?: () => void;
}

const CONTAINER_PADDING = 24;
const CONTAINER_BORDER_RADIUS = 12;
const TITLE_FONT_SIZE = 18;
const MESSAGE_FONT_SIZE = 14;
const BUTTON_PADDING_V = 12;
const BUTTON_PADDING_H = 24;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_FONT_SIZE = 14;
const DISMISS_FONT_SIZE = 13;
const DISMISS_PADDING_V = 8;
const SECTION_GAP = 16;
const TITLE_MARGIN = 8;
const CTA_MARGIN = 8;

const styles = StyleSheet.create({
  container: {
    padding: CONTAINER_PADDING,
    borderRadius: CONTAINER_BORDER_RADIUS,
    borderWidth: 1,
    alignItems: 'center',
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '700',
    marginBottom: TITLE_MARGIN,
    textAlign: 'center',
  },
  message: {
    fontSize: MESSAGE_FONT_SIZE,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: SECTION_GAP,
  },
  ctaButton: {
    paddingVertical: BUTTON_PADDING_V,
    paddingHorizontal: BUTTON_PADDING_H,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    width: '100%',
    marginBottom: CTA_MARGIN,
  },
  ctaText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '700',
  },
  dismissButton: {
    paddingVertical: DISMISS_PADDING_V,
  },
  dismissText: {
    fontSize: DISMISS_FONT_SIZE,
  },
});

const UpgradePrompt = ({ requiredPlan, currentPlan, onDismiss }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const router = useRouter();

  function handleUpgradePress(): void {
    router.push(Routes.BILLING_SETTINGS);
  }

  return (
    <View
      style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={TestIds.UPGRADE_PROMPT}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {FM('settings.billing.upgradePrompt.title')}
      </Text>
      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {FM('settings.billing.upgradePrompt.message', requiredPlan, currentPlan)}
      </Text>

      <TouchableOpacity
        accessibilityHint={FM('settings.billing.upgradePrompt.ctaHint')}
        accessibilityLabel={FM('settings.billing.upgradePrompt.cta')}
        accessibilityRole="button"
        style={[styles.ctaButton, { backgroundColor: primary }]}
        testID={TestIds.UPGRADE_PROMPT_CTA}
        onPress={handleUpgradePress}
      >
        <Text style={[styles.ctaText, { color: colors.surface }]}>
          {FM('settings.billing.upgradePrompt.cta')}
        </Text>
      </TouchableOpacity>

      {isValueDefined(onDismiss) ? (
        <TouchableOpacity
          accessibilityHint={FM('settings.billing.upgradePrompt.dismissHint')}
          accessibilityLabel={FM('settings.billing.upgradePrompt.dismiss')}
          accessibilityRole="button"
          style={styles.dismissButton}
          testID={TestIds.UPGRADE_PROMPT_DISMISS}
          onPress={onDismiss}
        >
          <Text style={[styles.dismissText, { color: colors.textSecondary }]}>
            {FM('settings.billing.upgradePrompt.dismiss')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default UpgradePrompt;
