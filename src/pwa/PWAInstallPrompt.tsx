import React, { useEffect, useRef } from 'react';

import { Animated, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../shared/testIds';
import { useTheme } from '../theme/hooks/useTheme';
import { typography } from '../theme/utils/styles';

const AUTO_DISMISS_MS = 5000;
const SLIDE_DURATION = 300;
const TOAST_MAX_WIDTH = 380;
const TOAST_PADDING = 14;
const TOAST_BORDER_RADIUS = 12;
const TOAST_MARGIN = 16;
const BUTTON_PADDING_V = 8;
const BUTTON_PADDING_H = 14;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_GAP = 8;
const SHADOW_OPACITY = 0.15;
const SHADOW_RADIUS = 12;
const SHADOW_OFFSET_Y = 4;
const BORDER_WIDTH = 1;
const SLIDE_OFFSCREEN = -200;
const BUTTON_FONT_SIZE = 13;
const TITLE_FONT_SIZE = 14;
const BODY_FONT_SIZE = 12;
const BODY_MARGIN_TOP = 2;

interface PWAInstallPromptProps {
  visible: boolean;
  onInstall: () => void;
  onCancel: () => void;
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: TOAST_MARGIN,
    right: TOAST_MARGIN,
    maxWidth: TOAST_MAX_WIDTH,
    width: '90%',
    zIndex: 1000,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: TOAST_PADDING,
    borderRadius: TOAST_BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
    boxShadow: `0px ${SHADOW_OFFSET_Y}px ${SHADOW_RADIUS}px rgba(0, 0, 0, ${SHADOW_OPACITY})`,
    elevation: 6,
  },
  textContainer: { flex: 1, marginRight: BUTTON_GAP },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: '700' },
  body: { fontSize: BODY_FONT_SIZE, marginTop: BODY_MARGIN_TOP },
  buttonRow: { flexDirection: 'row', gap: BUTTON_GAP },
  installButton: {
    paddingVertical: BUTTON_PADDING_V,
    paddingHorizontal: BUTTON_PADDING_H,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
  },
  dismissButton: {
    paddingVertical: BUTTON_PADDING_V,
    paddingHorizontal: BUTTON_PADDING_H,
    alignItems: 'center',
  },
  buttonText: { fontSize: BUTTON_FONT_SIZE },
});

export const PWAInstallPrompt = ({ visible, onInstall, onCancel }: PWAInstallPromptProps): React.ReactElement | null => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const accent = theme.palette.accent['500'];
  const slideAnim = useRef(new Animated.Value(SLIDE_OFFSCREEN)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(slideAnim, { toValue: 0, duration: SLIDE_DURATION, useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacityAnim, { toValue: 1, duration: SLIDE_DURATION, useNativeDriver: Platform.OS !== 'web' }),
      ]).start();

      timerRef.current = setTimeout(() => {
        onCancel();
      }, AUTO_DISMISS_MS);
    } else {
      slideAnim.setValue(SLIDE_OFFSCREEN);
      opacityAnim.setValue(0);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [visible, slideAnim, opacityAnim, onCancel]);

  if (!visible) return null;

  const titleText = FM('pwa.installTitle');
  const bodyText = FM('pwa.installBody');
  const installButtonText = FM('pwa.installButton');
  const dismissText = FM('pwa.dismiss');

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }], opacity: opacityAnim }]}
      testID={TestIds.PWA_INSTALL_PROMPT}
    >
      <View style={[styles.toast, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <View style={styles.textContainer}>
          <Text style={[styles.title, { color: colors.text }]}>{titleText}</Text>
          <Text style={[styles.body, { color: colors.textSecondary }]}>{bodyText}</Text>
        </View>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            accessibilityHint={FM('pwa.installHint')}
            accessibilityLabel={installButtonText}
            accessibilityRole="button"
            style={[styles.installButton, { backgroundColor: accent }]}
            testID={TestIds.PWA_INSTALL_BUTTON}
            onPress={onInstall}
          >
            <Text style={[typography.button, styles.buttonText, { color: colors.background }]}>{installButtonText}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            accessibilityHint={FM('pwa.cancelHint')}
            accessibilityLabel={dismissText}
            accessibilityRole="button"
            style={styles.dismissButton}
            testID={TestIds.PWA_CANCEL_BUTTON}
            onPress={onCancel}
          >
            <Text style={[typography.body, styles.buttonText, { color: colors.textSecondary }]}>{dismissText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
};
