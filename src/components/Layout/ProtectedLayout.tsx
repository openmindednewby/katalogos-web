import React, { useMemo, useRef, useState } from 'react';

import { Animated, Platform, StyleSheet, TouchableOpacity, View } from 'react-native';

import { useBreakpoint } from '../../hooks/useBreakpoint';
import { useGetRole } from '../../hooks/useGetRole';
import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';
import VerificationPendingBanner from '../Auth/VerificationPendingBanner';
import SkipNavLink from '../Shared/SkipNavLink';
import MobileSidebarCollapsed from '../Sidebar/MobileSidebarCollapsed';
import Sidebar from '../Sidebar/Sidebar';
import MobileTopbar from '../Topbar/MobileTopbar';
import Topbar from '../Topbar/Topbar';

interface Props {
  children?: React.ReactNode;
}

/**
 * Overlay backdrop uses a fixed black color because the theme system
 * (ThemeModeColors) does not include an overlay/scrim token.
 * A semi-transparent black overlay is standard UX regardless of theme mode.
 */
const OVERLAY_BACKDROP_COLOR = '#000';
const SIDEBAR_BACKDROP_OPACITY = 0.5;
const SIDEBAR_SLIDE_OFFSET = -40;

const styles = StyleSheet.create({
  overlayBackdropBackground: { backgroundColor: OVERLAY_BACKDROP_COLOR },
  sidebarContainer: { width: '100%' },
  touchToCloseArea: { position: 'absolute', left: '80%', top: 0, right: 0, bottom: 0 },
});

const ProtectedLayout = ({ children }: Props): React.ReactElement => {
  const { isPhone, isDesktop } = useBreakpoint();
  const { theme } = useTheme();
  const colors = theme.colors;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sidebarAnim = useRef(new Animated.Value(0)).current;
  const { isUser } = useGetRole();

  const layoutWrapperStyle = useMemo(
    () => [layoutStyles.layoutWrapper, { backgroundColor: colors.background }],
    [colors.background],
  );

  const backdropStyle = useMemo(
    () => ({ opacity: sidebarAnim.interpolate({ inputRange: [0, 1], outputRange: [0, SIDEBAR_BACKDROP_OPACITY] }) }),
    [sidebarAnim],
  );
  const panelTransform = useMemo(
    () => [{ translateX: sidebarAnim.interpolate({ inputRange: [0, 1], outputRange: [SIDEBAR_SLIDE_OFFSET, 0] }) }],
    [sidebarAnim],
  );

  const overlayBackdropStyle = useMemo(
    () => [layoutStyles.overlayBackdrop, styles.overlayBackdropBackground, backdropStyle],
    [backdropStyle],
  );

  const drawerPanelStyle = useMemo(
    () => [
      layoutStyles.drawerPanelLeft,
      { backgroundColor: colors.surface, borderRightColor: colors.border, transform: panelTransform },
    ],
    [colors.border, colors.surface, panelTransform],
  );

  const showCollapsedSidebar = !isDesktop && !isPhone && !isUser;
  const showSidebarOverlay = !isDesktop && sidebarOpen;

  function openSidebar(): void {
    setSidebarOpen(true);
    Animated.timing(sidebarAnim, { toValue: 1, duration: 220, useNativeDriver: Platform.OS !== 'web' }).start();
  }

  function closeSidebar(): void {
    Animated.timing(sidebarAnim, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start(({ finished }) => {
      if (finished) setSidebarOpen(false);
    });
  }

  const topbar = isDesktop
    ? <Topbar showAccountButton={false} />
    : <MobileTopbar showAccountButton={false} />;

  return (
    <View style={layoutWrapperStyle}>
      <SkipNavLink targetId="main-content" />

      {/* Sidebar section — collapsed bar on tablet only, hidden on phone */}
      {showCollapsedSidebar ? <MobileSidebarCollapsed onMenuPress={openSidebar} /> : null}
      {isDesktop ? <Sidebar /> : null}

      {/* Main content */}
      <View style={layoutStyles.mainArea}>
        {topbar}
        {/*
          The verification-pending banner sits between the topbar and the page
          outlet so it's visible on every authenticated route. It renders
          `null` when `email_verified === true` (or claim missing), so it adds
          zero layout overhead for verified users.
        */}
        <VerificationPendingBanner />
        <View nativeID="main-content" style={layoutStyles.content} testID={TestIds.MAIN_CONTENT_REGION}>{children}</View>
      </View>

      {/* Sidebar overlay on phone and tablet screens */}
      {showSidebarOverlay ? <View style={layoutStyles.overlayBackdrop}>
          {/* Backdrop */}
          <Animated.View style={overlayBackdropStyle} />
          {/* Sliding panel */}
          <Animated.View
            style={drawerPanelStyle}
          >
            <Sidebar containerStyle={styles.sidebarContainer} onItemPress={closeSidebar} />
          </Animated.View>
          <TouchableOpacity
            accessibilityHint={FM('layout.closeSidebarHint')}
            accessibilityLabel={FM('layout.closeSidebar')}
            accessibilityRole="button"
            style={styles.touchToCloseArea}
            testID={TestIds.LAYOUT_CLOSE_SIDEBAR_OVERLAY}
            onPress={closeSidebar}
          />
        </View> : null}
    </View>
  );
};

export default ProtectedLayout;
