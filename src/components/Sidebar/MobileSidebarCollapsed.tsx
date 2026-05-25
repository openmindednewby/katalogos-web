import React, { useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useSelector } from 'react-redux';

import MobileDarkModeButton from './MobileDarkModeButton';
import { groupSidebarItems } from './utils/groupSidebarItems';
import { useAuth } from '../../auth/AuthProvider';
import { FM } from '../../localization/helpers';
import { moduleRegistry } from '../../modules';
import { Routes } from '../../navigation/routes';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';
import { isValueDefined } from '../../utils/is';
import { SvgIcon } from '../Icons';

import type { RootState } from '../../store/reduxStore';
import type { IconName } from '../Icons';

interface Props {
  onMenuPress: () => void;
}

const TRANSPARENT_COLOR = 'transparent';
const SIDEBAR_ICON_SIZE = 18;
const MENU_ICON_SIZE = 20;
const DEFAULT_SIDEBAR_ICON: IconName = 'circle';

const styles = StyleSheet.create({
  iconButtonTransparent: { backgroundColor: TRANSPARENT_COLOR },
});

function isValidIconName(value: string): value is IconName {
  const validNames: readonly string[] = [
    'menu', 'home', 'logout', 'close', 'edit', 'trash', 'eye', 'link',
    'refresh', 'lightning', 'bell', 'play', 'chevronDown', 'chevronUp',
    'chevronLeft', 'chevronRight', 'arrowUp', 'arrowDown', 'grid', 'list',
    'cards', 'compact', 'diamond', 'squareFill', 'document', 'checkmark',
    'memo', 'forkKnife', 'building', 'people', 'circle', 'barChart',
    'trendingUp', 'target', 'crosshair', 'fileText', 'monitor', 'server',
    'triangle', 'sliders', 'shield', 'key', 'settings', 'sun', 'moon',
  ];
  return validNames.includes(value);
}

function resolveIconName(icon: string | undefined): IconName {
  const isKnownIcon = isValueDefined(icon) && icon !== '' && isValidIconName(icon);
  if (isKnownIcon) return icon;
  return DEFAULT_SIDEBAR_ICON;
}

const MobileSidebarCollapsed = ({ onMenuPress }: Props): React.ReactElement => {
  const router = useRouter();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const userInfo = useSelector((s: RootState) => s.auth.userInfo);
  const colors = theme.colors;

  const roleList = userInfo?.roles;

  const groupedItems = useMemo(() => {
    const flat = moduleRegistry.getSidebarItemsForRoles(roleList ?? []);
    return groupSidebarItems(flat);
  }, [roleList]);

  const containerStyle = React.useMemo(
    () => [
      layoutStyles.mobileSidebarCollapsed,
      { backgroundColor: colors.surface, borderRightColor: colors.border },
    ],
    [colors.border, colors.surface],
  );
  const subtextColorStyle = React.useMemo(() => ({ color: colors.textSecondary }), [colors.textSecondary]);

  function handleLogoutPress(): void {
    logout().catch(() => {});
  }

  return (
    <View style={containerStyle}>
      <TouchableOpacity
        accessible
        accessibilityHint={FM('menu.openHint')}
        accessibilityLabel={FM('menu.open')}
        accessibilityRole="button"
        style={[layoutStyles.mobileSidebarIconButton, styles.iconButtonTransparent]}
        testID={TestIds.NAV_MENU}
        onPress={onMenuPress}
      >
        <SvgIcon color={colors.text} name="menu" size={MENU_ICON_SIZE} />
        <Text style={[layoutStyles.mobileSidebarIconLabel, subtextColorStyle]}>{FM('menu.title')}</Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityHint={FM('menu.homeHint')}
        accessibilityLabel={FM('menu.home')}
        accessibilityRole="button"
        style={layoutStyles.mobileSidebarIconButton}
        testID={TestIds.NAV_HOME}
        onPress={() => router.push(Routes.DASHBOARD)}
      >
        <SvgIcon color={colors.text} name="home" size={SIDEBAR_ICON_SIZE} />
      </TouchableOpacity>

      {groupedItems.map((item) => {
        const hasChildren = isValueDefined(item.children) && item.children.length > 0;

        if (hasChildren)
          return (
            <TouchableOpacity
              key={item.key}
              accessibilityHint={FM('menu.expandSection')}
              accessibilityLabel={FM(item.labelKey)}
              accessibilityRole="button"
              style={layoutStyles.mobileSidebarIconButton}
              testID={item.key}
              onPress={onMenuPress}
            >
              <SvgIcon color={colors.text} name={resolveIconName(item.icon)} size={SIDEBAR_ICON_SIZE} />
            </TouchableOpacity>
          );

        return (
          <TouchableOpacity
            key={item.key}
            accessibilityHint={FM('menu.navigateToHint', FM(item.labelKey))}
            accessibilityLabel={FM(item.labelKey)}
            accessibilityRole="button"
            style={layoutStyles.mobileSidebarIconButton}
            testID={item.key}
            onPress={() => {
              router.push(item.route);
            }}
          >
            <SvgIcon color={colors.text} name={resolveIconName(item.icon)} size={SIDEBAR_ICON_SIZE} />
          </TouchableOpacity>
        );
      })}

      {/* Spacer pushes footer controls to the bottom */}
      <View style={layoutStyles.sidebarSpacer} />

      <MobileDarkModeButton />

      <TouchableOpacity
        accessible
        accessibilityHint={FM('topbar.logoutHint')}
        accessibilityLabel={FM('topbar.logout')}
        accessibilityRole="button"
        style={layoutStyles.mobileSidebarIconButton}
        testID={TestIds.LOGOUT_BUTTON}
        onPress={handleLogoutPress}
      >
        <SvgIcon color={colors.text} name="logout" size={SIDEBAR_ICON_SIZE} />
      </TouchableOpacity>
    </View>
  );
};

export default MobileSidebarCollapsed;
