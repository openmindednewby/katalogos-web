/**
 * A subtle banner displayed when the user is offline and viewing a cached menu.
 * Web-only component -- native apps handle offline state differently.
 */
import React, { memo, useCallback, useState } from 'react';

import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '../../../localization/helpers';
import { CommonTestIds } from '../../../shared/testIds/commonTestIds';

const BANNER_PADDING_V = 8;
const BANNER_PADDING_H = 16;
const FONT_SIZE = 13;
const DISMISS_FONT_SIZE = 18;
const DISMISS_AREA_SIZE = 28;
const BORDER_RADIUS = 0;
const SHADOW_OPACITY = 0.1;
const SHADOW_RADIUS = 4;
const SHADOW_OFFSET_Y = 2;

const SHADOW_COLOR = '#000';
const DISMISS_SYMBOL = '\u00D7';

/** Default amber palette used when no custom colors are provided. */
const DEFAULT_BG_COLOR = '#FEF3C7';
const DEFAULT_TEXT_COLOR = '#92400E';
const DEFAULT_BORDER_COLOR = '#F59E0B';

interface OfflineBannerProps {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderRadius: BORDER_RADIUS,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: BANNER_PADDING_H,
    paddingVertical: BANNER_PADDING_V,
    shadowColor: SHADOW_COLOR,
    shadowOffset: { width: 0, height: SHADOW_OFFSET_Y },
    shadowOpacity: SHADOW_OPACITY,
    shadowRadius: SHADOW_RADIUS,
    elevation: 2,
  },
  text: {
    fontSize: FONT_SIZE,
    flex: 1,
    textAlign: 'center',
  },
  dismissButton: {
    width: DISMISS_AREA_SIZE,
    height: DISMISS_AREA_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dismissText: {
    fontSize: DISMISS_FONT_SIZE,
    lineHeight: DISMISS_FONT_SIZE,
  },
});

/**
 * Shows a subtle banner informing the user that they are
 * viewing a cached (offline) version of the menu.
 *
 * Only renders on web platform. Returns null on native or when dismissed.
 */
const OfflineBanner: React.FC<OfflineBannerProps> = ({
  backgroundColor = DEFAULT_BG_COLOR,
  textColor = DEFAULT_TEXT_COLOR,
  borderColor = DEFAULT_BORDER_COLOR,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = useCallback(() => {
    setIsDismissed(true);
  }, []);

  if (Platform.OS !== 'web') return null;
  if (isDismissed) return null;

  return (
    <View
      accessibilityHint={FM('publicMenu.offline.bannerHint')}
      accessibilityLabel={FM('publicMenu.offline.bannerLabel')}
      accessibilityRole="alert"
      style={[styles.container, { backgroundColor, borderBottomColor: borderColor }]}
      testID={CommonTestIds.OFFLINE_BANNER}
    >
      <Text style={[styles.text, { color: textColor }]}>
        {FM('pwa.offlineBanner')}
      </Text>
      <TouchableOpacity
        accessibilityHint={FM('pwa.offlineDismissHint')}
        accessibilityLabel={FM('pwa.dismiss')}
        style={styles.dismissButton}
        testID={CommonTestIds.OFFLINE_BANNER_DISMISS}
        onPress={handleDismiss}
      >
        <Text style={[styles.dismissText, { color: textColor }]}>{DISMISS_SYMBOL}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default memo(OfflineBanner);
