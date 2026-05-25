/**
 * UpgradePrompt - shown when a free-tier user hits a feature limit.
 * Displays a message about the required tier and a CTA to navigate
 * to the billing page.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { FM } from '../../localization/helpers';
import { Routes } from '../../navigation/routes';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';

interface Props {
  /** The human-readable name of the required tier (e.g. "Pro"). */
  requiredTier: string;
  /** The current tier name (e.g. "Free"). */
  currentTier: string;
  /** Called when the user dismisses the prompt. */
  onDismiss?: () => void;
}

const PROMPT_PADDING = 20;
const PROMPT_BORDER_RADIUS = 12;
const PROMPT_BORDER_WIDTH = 1;
const TITLE_FONT_SIZE = 16;
const MESSAGE_FONT_SIZE = 14;
const BUTTON_PADDING_V = 12;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_FONT_SIZE = 14;
const DISMISS_FONT_SIZE = 13;
const TITLE_MARGIN_BOTTOM = 8;
const MESSAGE_MARGIN_BOTTOM = 16;
const CTA_MARGIN_BOTTOM = 8;

const styles = StyleSheet.create({
  container: {
    padding: PROMPT_PADDING,
    borderRadius: PROMPT_BORDER_RADIUS,
    borderWidth: PROMPT_BORDER_WIDTH,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '700',
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  message: {
    fontSize: MESSAGE_FONT_SIZE,
    marginBottom: MESSAGE_MARGIN_BOTTOM,
  },
  cta: {
    paddingVertical: BUTTON_PADDING_V,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    marginBottom: CTA_MARGIN_BOTTOM,
  },
  ctaText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '700',
  },
  dismiss: {
    alignItems: 'center',
    paddingVertical: BUTTON_PADDING_V,
  },
  dismissText: {
    fontSize: DISMISS_FONT_SIZE,
  },
});

const UpgradePrompt = ({
  requiredTier,
  currentTier,
  onDismiss,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const router = useRouter();

  function handleUpgradePress(): void {
    router.push(Routes.BILLING_SETTINGS);
  }

  return (
    <View
      style={[styles.container, { borderColor: primary, backgroundColor: colors.surface }]}
      testID={TestIds.UPGRADE_PROMPT}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        {FM('settings.billing.upgradePrompt.title')}
      </Text>

      <Text style={[styles.message, { color: colors.textSecondary }]}>
        {FM('settings.billing.upgradePrompt.message', requiredTier, currentTier)}
      </Text>

      <TouchableOpacity
        accessibilityHint={FM('settings.billing.upgradePrompt.ctaHint')}
        accessibilityLabel={FM('settings.billing.upgradePrompt.cta')}
        accessibilityRole="button"
        style={[styles.cta, { backgroundColor: primary }]}
        testID={TestIds.UPGRADE_PROMPT_CTA}
        onPress={handleUpgradePress}
      >
        <Text style={[styles.ctaText, { color: colors.surface }]}>
          {FM('settings.billing.upgradePrompt.cta')}
        </Text>
      </TouchableOpacity>

      {onDismiss ? (
        <TouchableOpacity
          accessibilityHint={FM('settings.billing.upgradePrompt.dismissHint')}
          accessibilityLabel={FM('settings.billing.upgradePrompt.dismiss')}
          accessibilityRole="button"
          style={styles.dismiss}
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
