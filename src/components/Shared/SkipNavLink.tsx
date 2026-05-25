/**
 * SkipNavLink - Visually hidden link that becomes visible on focus.
 * Allows keyboard users to skip past navigation directly to main content.
 * Only rendered on web where keyboard navigation is primary.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { Platform, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

const Z_INDEX_SKIP_NAV = 9999;
const SKIP_NAV_PADDING = 12;
const SKIP_NAV_FONT_SIZE = 16;
const SKIP_NAV_BORDER_RADIUS = 4;
const SKIP_NAV_OFF_SCREEN = -9999;
const SKIP_NAV_VISIBLE_TOP = 8;

/** Text color for the skip navigation link on primary background. */
const SKIP_NAV_TEXT_COLOR = '#ffffff';

const styles = StyleSheet.create({
  link: {
    position: 'absolute',
    top: SKIP_NAV_OFF_SCREEN,
    left: 0,
    zIndex: Z_INDEX_SKIP_NAV,
    paddingHorizontal: SKIP_NAV_PADDING,
    paddingVertical: SKIP_NAV_PADDING,
    borderRadius: SKIP_NAV_BORDER_RADIUS,
  },
  text: {
    fontSize: SKIP_NAV_FONT_SIZE,
    fontWeight: '700',
    color: SKIP_NAV_TEXT_COLOR,
  },
});

interface SkipNavLinkProps {
  targetId: string;
}

const SkipNavLink: React.FC<SkipNavLinkProps> = ({ targetId }) => {
  const { theme } = useTheme();
  const primaryColor = theme.palette.primary['500'];
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = useCallback(() => setIsFocused(true), []);
  const handleBlur = useCallback(() => setIsFocused(false), []);

  const linkStyle = useMemo(
    () => [styles.link, { backgroundColor: primaryColor, top: isFocused ? SKIP_NAV_VISIBLE_TOP : SKIP_NAV_OFF_SCREEN }],
    [primaryColor, isFocused],
  );

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') return;

    const target = document.getElementById(targetId);
    if (target) {
      target.setAttribute('tabindex', '-1');
      target.focus();
    }
  }, [targetId]);

  if (Platform.OS !== 'web') return null;

  return (
    <TouchableOpacity
      accessibilityHint={FM('accessibility.skipToMainContentHint')}
      accessibilityLabel={FM('accessibility.skipToMainContent')}
      accessibilityRole="link"
      style={linkStyle}
      testID={TestIds.SKIP_NAV_LINK}
      onBlur={handleBlur}
      onFocus={handleFocus}
      onPress={handlePress}
    >
      <Text style={styles.text}>
        {FM('accessibility.skipToMainContent')}
      </Text>
    </TouchableOpacity>
  );
};

export default SkipNavLink;
