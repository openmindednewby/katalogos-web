import React, { useMemo } from 'react';

import { View, Text, TouchableOpacity, type ViewStyle } from 'react-native';

import { usePathname, useRouter } from 'expo-router';

import { useSelector } from 'react-redux';

import DarkModeToggle from './DarkModeToggle';
import NavExpandableItem from './NavExpandableItem';
import { groupSidebarItems } from './utils/groupSidebarItems';
import { useAuth } from '../../auth/AuthProvider';
import { FM } from '../../localization/helpers';
import { moduleRegistry } from '../../modules';
import { Routes } from '../../navigation/routes';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';
import { isValueDefined } from '../../utils/is';

import type { RootState } from '../../store/reduxStore';
import type { SidebarItem } from '@baseclient/core';

const ACTIVE_BORDER_RADIUS = 4;

interface Props {
  containerStyle?: ViewStyle | ViewStyle[];
  onItemPress?: () => void;
}

function hasExpandableChildren(item: SidebarItem): boolean {
  return isValueDefined(item.children) && item.children.length > 0;
}

/** Check if a route matches the current pathname. */
function isRouteActive(pathname: string, route: string): boolean {
  if (route === '/') return pathname === '/';
  return pathname === route || pathname.startsWith(`${route}/`);
}

const Sidebar = ({ containerStyle, onItemPress }: Props): React.ReactElement => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { theme } = useTheme();
  const userInfo = useSelector((s: RootState) => s.auth.userInfo);

  const colors = theme.colors;
  const primaryColor = theme.palette.primary['500'];

  const nav = (route: Routes) => (): void => {
    router.push(route);
    onItemPress?.();
  };

  const roles = userInfo?.roles;
  const sidebarItems = useMemo(() => {
    const flat = moduleRegistry.getSidebarItemsForRoles(roles ?? []);
    return groupSidebarItems(flat);
  }, [roles]);

  const expandableColors = useMemo(() => ({
    text: colors.text,
    textSecondary: colors.textSecondary,
    border: colors.border,
  }), [colors.text, colors.textSecondary, colors.border]);

  const isHomeActive = isRouteActive(pathname, Routes.DASHBOARD);

  const activeItemStyle = useMemo(() => ({
    backgroundColor: colors.border,
    borderRadius: ACTIVE_BORDER_RADIUS,
  }), [colors.border]);

  function handleLogoutPress(): void {
    logout().catch(() => {});
    onItemPress?.();
  }

  return (
    <View
      accessibilityRole="none"
      aria-label={FM('accessibility.navigationRegion')}
      role="navigation"
      style={[
        layoutStyles.sidebarContainer,
        { backgroundColor: colors.surface, borderRightColor: colors.border },
        containerStyle,
      ]}
    >
      <Text accessibilityRole="header" style={[layoutStyles.sidebarTitle, { color: colors.text }]}>
        {FM('menu.title')}
      </Text>

      <TouchableOpacity
        accessibilityHint={FM('menu.homeHint')}
        accessibilityLabel={FM('menu.home')}
        accessibilityRole="button"
        style={[layoutStyles.sidebarItem, isHomeActive ? activeItemStyle : undefined]}
        testID={TestIds.NAV_HOME}
        onPress={nav(Routes.DASHBOARD)}
      >
        <Text style={[layoutStyles.sidebarItemText, { color: isHomeActive ? primaryColor : colors.text }]}>
          {FM('menu.home')}
        </Text>
      </TouchableOpacity>

      {sidebarItems.map((item) =>
        hasExpandableChildren(item) ? (
          <NavExpandableItem
            key={item.key}
            colors={expandableColors}
            item={item}
            primaryColor={primaryColor}
            onItemPress={onItemPress}
          />
        ) : (
          <TouchableOpacity
            key={item.key}
            accessibilityHint={FM('menu.navigateToHint', FM(item.labelKey))}
            accessibilityLabel={FM(item.labelKey)}
            accessibilityRole="button"
            style={[layoutStyles.sidebarItem, isRouteActive(pathname, item.route) ? activeItemStyle : undefined]}
            testID={item.key}
            onPress={() => {
              router.push(item.route);
              onItemPress?.();
            }}
          >
            <Text style={[layoutStyles.sidebarItemText, { color: isRouteActive(pathname, item.route) ? primaryColor : colors.text }]}>
              {FM(item.labelKey)}
            </Text>
          </TouchableOpacity>
        ),
      )}

      {/* Spacer pushes footer controls to the bottom */}
      <View style={layoutStyles.sidebarSpacer} />

      <DarkModeToggle />

      <TouchableOpacity
        accessible
        accessibilityHint={FM('topbar.logoutHint')}
        accessibilityLabel={FM('topbar.logout')}
        accessibilityRole="button"
        style={layoutStyles.sidebarItem}
        testID={TestIds.LOGOUT_BUTTON}
        onPress={handleLogoutPress}
      >
        <Text style={[layoutStyles.sidebarItemText, { color: colors.text }]}>
          {FM('topbar.logout')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default Sidebar;
