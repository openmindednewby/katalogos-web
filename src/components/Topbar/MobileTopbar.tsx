import React, { useMemo, useRef, useState } from 'react';

import { Animated, Platform, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

import { useDispatch, useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import { useAuth } from '../../auth/AuthProvider';
import ThemeMode from '../../shared/enums/ThemeMode';
import { TestIds } from '../../shared/testIds';
import { setLocale } from '../../store/slices/uiSlice';
import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';
import { TenantLogo } from '../core/TenantLogo';
import SafeNotificationBell from '../Notifications/SafeNotificationBell';

import type { RootState } from '../../store/reduxStore';

interface Props {
  showAccountButton?: boolean;
}

const DRAWER_BACKDROP_COLOR = '#00000088';
const TOPBAR_HEIGHT = 40;

const styles = StyleSheet.create({
  menuText: { fontWeight: '600' },
  overlayContainer: { zIndex: 999 },
  backdrop: { backgroundColor: DRAWER_BACKDROP_COLOR },
  panel: { zIndex: 1000 },
  userBlock: { marginBottom: 16 },
  userName: { fontWeight: '700' },
  userEmail: { fontSize: 12 },
  drawerItemRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  closeButton: { marginTop: 12 },
});

const MobileTopbar = ({ showAccountButton = false }: Props): React.ReactElement => {
  const { user, userInfo, logout } = useAuth();
  const dispatch = useDispatch();
  const { theme, mode, toggleMode } = useTheme();
  const locale = useSelector((s: RootState) => s.ui.locale);
  const colors = theme.colors;
  const primaryColor = theme.palette.primary['500'];
  const secondaryColor = theme.palette.secondary['500'];
  const [open, setOpen] = useState(false);
  const openAnim = useRef(new Animated.Value(0)).current;

  const panelTransform = useMemo(
    () => [{ translateX: openAnim.interpolate({ inputRange: [0, 1], outputRange: [TOPBAR_HEIGHT, 0] }) }],
    [openAnim]
  );

  function openDrawer(): void {
    setOpen(true);
    Animated.timing(openAnim, { toValue: 1, duration: 220, useNativeDriver: Platform.OS !== 'web' }).start();
  }

  function closeDrawer(): void {
    Animated.timing(openAnim, { toValue: 0, duration: 200, useNativeDriver: Platform.OS !== 'web' }).start(({ finished }) => {
      if (finished) setOpen(false);
    });
  }

  function handleLogoutPress(): void {
    logout().catch(() => {});
    closeDrawer();
  }

  return (
    <>
      <View style={[layoutStyles.mobileTopbarContainer, { borderBottomColor: colors.border, backgroundColor: colors.background }]}>
        <TenantLogo />
        <View style={layoutStyles.topbarRight}>
          <SafeNotificationBell />
          <TouchableOpacity
            accessible
            accessibilityHint={FM('topbar.menuHint')}
            accessibilityLabel={FM('topbar.menu')}
            accessibilityRole="button"
            style={[layoutStyles.mobileTopbarButton, { backgroundColor: primaryColor }]}
            testID={TestIds.NAV_MENU}
            onPress={openDrawer}
          >
            <Text style={[styles.menuText, { color: colors.background }]}>{FM('topbar.menu')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {open ? (
        <View style={[layoutStyles.overlayBackdrop, styles.overlayContainer]}>
          <TouchableOpacity
            accessibilityHint={FM('common.closeHint')}
            accessibilityLabel={FM('common.close')}
            accessibilityRole="button"
            style={[layoutStyles.overlayBackdrop, styles.backdrop]}
            testID={TestIds.DRAWER_BACKDROP}
            onPress={closeDrawer}
          />
          <Animated.View style={[layoutStyles.drawerPanelRight, { backgroundColor: colors.surface, borderLeftColor: colors.border, transform: panelTransform }, styles.panel]}>
            <View style={styles.userBlock}>
              <Text style={[styles.userName, { color: colors.text }]}>{user?.displayName ?? userInfo?.preferred_username ?? '---'}</Text>
              <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{user?.email ?? userInfo?.email ?? ''}</Text>
            </View>

            <View style={[layoutStyles.drawerItem, styles.drawerItemRow]}>
              <Text style={[layoutStyles.drawerItemText, { color: colors.text }]}>{FM('topbar.dark')}</Text>
              <Switch value={mode === ThemeMode.Dark} onValueChange={toggleMode} />
            </View>

            <TouchableOpacity
              accessibilityHint={FM('topbar.langHint')}
              accessibilityLabel={FM(`topbar.lang.${locale}`)}
              accessibilityRole="button"
              style={layoutStyles.drawerItem}
              testID={TestIds.DRAWER_LANGUAGE_SELECTOR}
              onPress={() => { dispatch(setLocale(locale)); closeDrawer(); }}
            >
              <Text style={[layoutStyles.drawerItemText, { color: colors.text }]}>{FM(`topbar.lang.${locale}`)}</Text>
            </TouchableOpacity>

            {showAccountButton ? (
              <TouchableOpacity
                accessibilityHint={FM('topbar.accountHint')}
                accessibilityLabel={FM('topbar.account')}
                accessibilityRole="button"
                style={layoutStyles.drawerItem}
                testID={TestIds.DRAWER_ACCOUNT_BUTTON}
                onPress={() => { closeDrawer(); }}
              >
                <Text style={[layoutStyles.drawerItemText, { color: colors.text }]}>{FM('topbar.account')}</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              accessible
              accessibilityHint={FM('topbar.logoutHint')}
              accessibilityLabel={FM('topbar.logout')}
              accessibilityRole="button"
              style={layoutStyles.drawerItem}
              testID={TestIds.LOGOUT_BUTTON}
              onPress={handleLogoutPress}
            >
              <Text style={[layoutStyles.drawerItemText, { color: String(colors.text) }]}>{FM('topbar.logout')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              accessibilityHint={FM('common.closeHint')}
              accessibilityLabel={FM('common.close')}
              accessibilityRole="button"
              style={[layoutStyles.mobileTopbarButton, styles.closeButton, { backgroundColor: secondaryColor }]}
              testID={TestIds.DRAWER_CLOSE_BUTTON}
              onPress={closeDrawer}
            >
              <Text style={[styles.menuText, { color: String(colors.textSecondary) }]}>{FM('common.close')}</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      ) : null}
    </>
  );
};

export default MobileTopbar;
