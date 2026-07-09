import React, { useMemo } from 'react';

import { Text, TouchableOpacity, type ViewStyle } from 'react-native';

import { usePathname, useRouter } from 'expo-router';

import { Sidebar as SharedSidebar } from '@dloizides/ui-nav';
import { useSelector } from 'react-redux';


import DarkModeToggle from './DarkModeToggle';
import { groupSidebarItems } from './utils/groupSidebarItems';
import { toNavItems } from './utils/toNavItems';
import { useAuth } from '../../auth/AuthProvider';
import { FM } from '../../localization/helpers';
import { moduleRegistry } from '../../modules';
import { Routes } from '../../navigation/routes';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';
import { SvgIcon } from '../Icons';

import type { RootState } from '../../store/reduxStore';

const ACTIVE_BORDER_RADIUS = 4;

interface Props {
  containerStyle?: ViewStyle | ViewStyle[];
  onItemPress?: () => void;
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

  const roles = userInfo?.roles;
  const sidebarItems = useMemo(
    () => groupSidebarItems(moduleRegistry.getSidebarItemsForRoles(roles ?? [])),
    [roles],
  );
  const navItems = toNavItems(sidebarItems);

  const isHomeActive = isRouteActive(pathname, Routes.DASHBOARD);
  const activeItemStyle = useMemo(
    () => ({ backgroundColor: colors.border, borderRadius: ACTIVE_BORDER_RADIUS }),
    [colors.border],
  );

  function handleNavigate(route: string): void {
    router.push(route);
    onItemPress?.();
  }

  function handleHomePress(): void {
    router.push(Routes.DASHBOARD);
    onItemPress?.();
  }

  function handleLogoutPress(): void {
    logout().catch(() => {});
    onItemPress?.();
  }

  const renderChevron = (expanded: boolean, color: string, size: number): React.ReactElement => (
    <SvgIcon color={color} name={expanded ? 'chevronUp' : 'chevronDown'} size={size} />
  );

  const header = (
    <TouchableOpacity
      accessibilityHint={FM('menu.homeHint')}
      accessibilityLabel={FM('menu.home')}
      accessibilityRole="button"
      style={[layoutStyles.sidebarItem, isHomeActive ? activeItemStyle : undefined]}
      testID={TestIds.NAV_HOME}
      onPress={handleHomePress}
    >
      <Text style={[layoutStyles.sidebarItemText, { color: isHomeActive ? primaryColor : colors.text }]}>
        {FM('menu.home')}
      </Text>
    </TouchableOpacity>
  );

  const footer = (
    <>
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
    </>
  );

  return (
    <SharedSidebar
      collapseHint={FM('menu.collapseSection')}
      containerStyle={containerStyle}
      expandHint={FM('menu.expandSection')}
      footer={footer}
      header={header}
      items={navItems}
      navigateHint={(label) => FM('menu.navigateToHint', label)}
      pathname={pathname}
      regionLabel={FM('accessibility.navigationRegion')}
      renderChevron={renderChevron}
      title={FM('menu.title')}
      onNavigate={handleNavigate}
    />
  );
};

export default Sidebar;
