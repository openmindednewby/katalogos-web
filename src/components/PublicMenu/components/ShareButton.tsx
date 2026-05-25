import React, { memo, useCallback, useEffect, useRef, useState } from 'react';

import { Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useEscapeKey } from '../../../hooks/useEscapeKey';
import { useAnalytics } from '../../../lib/analytics';
import { FM } from '../../../localization/helpers';
import AnalyticsEventName from '../../../shared/enums/AnalyticsEventName';
import { TestIds } from '../../../shared/testIds';
import { SHARE_OPTIONS } from '../utils/shareOptions';
import {
  COPIED_FEEDBACK_DURATION_MS,
  copyToClipboard,
  getShareUrl,
  isNativeShareSupported,
  triggerNativeShare,
} from '../utils/shareUtils';

import type SharePlatform from '../../../shared/enums/SharePlatform';

const BUTTON_SIZE = 48;
const DROPDOWN_WIDTH = 200;
const BORDER_RADIUS = 24;
const DROPDOWN_BORDER_RADIUS = 12;
const ICON_FONT_SIZE = 20;
const LABEL_FONT_SIZE = 15;
const SHADOW_OPACITY = 0.25;
const SHADOW_RADIUS = 4;
const SHADOW_OFFSET_Y = 2;
const ITEM_PADDING_V = 12;
const ITEM_PADDING_H = 16;
const DROPDOWN_BOTTOM_OFFSET = 56;
const ICON_MARGIN_RIGHT = 12;

const SHADOW_COLOR = '#000';

const SHARE_ICON = '\u2197';
const COPY_ICON = '\uD83D\uDD17';
const NATIVE_ICON = '\uD83D\uDCE4';

interface ShareButtonProps {
  menuUrl: string;
  menuName: string;
  primaryColor: string;
  textOnPrimary: string;
  surfaceColor: string;
  surfaceTextColor: string;
  successColor: string;
}

const BACKDROP_Z_INDEX = 999;
const BACKDROP_EXTEND = 9999;

const styles = StyleSheet.create({
  container: { position: 'absolute', bottom: 24, right: 24, alignItems: 'flex-end', zIndex: BACKDROP_Z_INDEX },
  backdrop: {
    position: 'absolute',
    top: -BACKDROP_EXTEND,
    left: -BACKDROP_EXTEND,
    right: -BACKDROP_EXTEND,
    bottom: -BACKDROP_EXTEND,
  },
  button: {
    width: BUTTON_SIZE, height: BUTTON_SIZE, borderRadius: BORDER_RADIUS,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: SHADOW_COLOR, shadowOffset: { width: 0, height: SHADOW_OFFSET_Y },
    shadowOpacity: SHADOW_OPACITY, shadowRadius: SHADOW_RADIUS, elevation: 5,
  },
  buttonIcon: { fontSize: ICON_FONT_SIZE },
  dropdown: {
    position: 'absolute', bottom: DROPDOWN_BOTTOM_OFFSET, right: 0,
    width: DROPDOWN_WIDTH, borderRadius: DROPDOWN_BORDER_RADIUS,
    shadowColor: SHADOW_COLOR, shadowOffset: { width: 0, height: SHADOW_OFFSET_Y },
    shadowOpacity: SHADOW_OPACITY, shadowRadius: SHADOW_RADIUS,
    elevation: 8,
  },
  item: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: ITEM_PADDING_V, paddingHorizontal: ITEM_PADDING_H,
  },
  icon: { fontSize: ICON_FONT_SIZE, marginRight: ICON_MARGIN_RIGHT },
  label: { fontSize: LABEL_FONT_SIZE },
});

/** Floating share button with a dropdown of social sharing options. */
export const ShareButton: React.FC<ShareButtonProps> = memo(({
  menuUrl, menuName, primaryColor, textOnPrimary, surfaceColor, surfaceTextColor, successColor,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { track } = useAnalytics();

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const shareText = FM('onlineMenus.socialSharing.shareText', menuName);

  const handleCloseDropdown = useCallback(() => { setIsOpen(false); }, []);
  useEscapeKey(handleCloseDropdown, isOpen);

  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handlePlatformShare = useCallback((platform: SharePlatform) => {
    const url = getShareUrl(platform, menuUrl, shareText);
    if (Platform.OS === 'web') window.open(url, '_blank', 'noopener,noreferrer');
    else Linking.openURL(url).catch(() => {});
    track(AnalyticsEventName.MenuShared, { platform });
    setIsOpen(false);
  }, [menuUrl, shareText, track]);

  const handleCopyLink = useCallback(async () => {
    const success = await copyToClipboard(menuUrl);
    if (success) {
      setShowCopied(true);
      timerRef.current = setTimeout(() => setShowCopied(false), COPIED_FEEDBACK_DURATION_MS);
    }
    track(AnalyticsEventName.MenuShared, { platform: 'copy_link' });
    setIsOpen(false);
  }, [menuUrl, track]);

  const handleNativeShare = useCallback(async () => {
    await triggerNativeShare(menuName, shareText, menuUrl);
    track(AnalyticsEventName.MenuShared, { platform: 'native' });
    setIsOpen(false);
  }, [menuName, menuUrl, shareText, track]);

  const copyLabel = showCopied
    ? FM('onlineMenus.socialSharing.linkCopied')
    : FM('onlineMenus.socialSharing.copyLink');

  return (
    <View style={styles.container}>
      {isOpen ? (
        <>
          <TouchableOpacity
            accessibilityHint={FM('publicMenu.dropdown.backdropHint')}
            accessibilityLabel={FM('publicMenu.dropdown.backdropLabel')}
            activeOpacity={1}
            style={styles.backdrop}
            testID={TestIds.PUBLIC_MENU_SHARE_BACKDROP}
            onPress={handleCloseDropdown}
          />
          <View accessibilityRole="menu" style={[styles.dropdown, { backgroundColor: surfaceColor }]} testID={TestIds.PUBLIC_MENU_SHARE_DROPDOWN}>
          {SHARE_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.testId}
              accessibilityHint={FM(opt.hintKey)}
              accessibilityLabel={FM(opt.labelKey)}
              accessibilityRole="button"
              style={styles.item}
              testID={opt.testId}
              onPress={() => handlePlatformShare(opt.platform)}
            >
              <Text style={[styles.icon, { color: surfaceTextColor }]}>{opt.icon}</Text>
              <Text style={[styles.label, { color: surfaceTextColor }]}>{FM(opt.labelKey)}</Text>
            </TouchableOpacity>
          ))}

          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.socialSharing.copyLinkHint')}
            accessibilityLabel={FM('onlineMenus.socialSharing.copyLink')}
            accessibilityRole="button"
            style={styles.item}
            testID={TestIds.PUBLIC_MENU_SHARE_COPY_LINK}
            onPress={handleCopyLink}
          >
            <Text style={[styles.icon, { color: surfaceTextColor }]}>{COPY_ICON}</Text>
            <Text style={[styles.label, { color: showCopied ? successColor : surfaceTextColor }]}>{copyLabel}</Text>
          </TouchableOpacity>

          {isNativeShareSupported() ? (
            <TouchableOpacity
              accessibilityHint={FM('onlineMenus.socialSharing.nativeShareHint')}
              accessibilityLabel={FM('onlineMenus.socialSharing.nativeShare')}
              accessibilityRole="button"
              style={styles.item}
              testID={TestIds.PUBLIC_MENU_SHARE_NATIVE}
              onPress={handleNativeShare}
            >
              <Text style={[styles.icon, { color: surfaceTextColor }]}>{NATIVE_ICON}</Text>
              <Text style={[styles.label, { color: surfaceTextColor }]}>{FM('onlineMenus.socialSharing.nativeShare')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
        </>
      ) : null}

      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.socialSharing.shareHint')}
        accessibilityLabel={FM('onlineMenus.socialSharing.shareMenu')}
        accessibilityRole="button"
        accessibilityState={{ expanded: isOpen }}
        style={[styles.button, { backgroundColor: primaryColor }]}
        testID={TestIds.PUBLIC_MENU_SHARE_BUTTON}
        onPress={toggleDropdown}
      >
        <Text style={[styles.buttonIcon, { color: textOnPrimary }]}>{SHARE_ICON}</Text>
      </TouchableOpacity>
    </View>
  );
});

ShareButton.displayName = 'ShareButton';
