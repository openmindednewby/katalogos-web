/**
 * ProtectedLayout — the authenticated app shell. Thin wiring over the shared
 * `@dloizides/ui-nav` `NavShell` (`layout="side"`): a persistent left rail on
 * desktop, the icon-only `CollapsedRail` on tablet, and the overlay drawer on
 * phone are all owned by NavShell/AppShell. This app supplies only DATA + STYLE:
 * the role-gated `NavItem[]`, the existing `Topbar` (header slot), the Home
 * shortcut + appearance/logout footer (rail slots), and the theme.
 *
 * Replaces the bespoke Animated overlay drawer + tablet rail + Mobile* files and
 * `layoutStyles`. testIDs the E2E drives (`logout-button`, `nav-home`,
 * `main-content-region`) and the `Main navigation` landmark name are preserved;
 * the phone drawer's "Menu" toggle keeps an accessible name the logout flow finds.
 */
import React, { useMemo } from 'react';

import { StyleSheet, View } from 'react-native';

import { usePathname, useRouter } from 'expo-router';

import { NavShell, isRouteActive, type NavItem } from '@dloizides/ui-nav';
import { useSelector } from 'react-redux';

import { SidebarFooter, SidebarHomeLink } from './sidebarChrome';
import { useAuth } from '../../auth/AuthProvider';
import { FM } from '../../localization/helpers';
import { moduleRegistry } from '../../modules';
import { Routes } from '../../navigation/routes';
import { PHONE_BREAKPOINT_PX, TABLET_BREAKPOINT_PX } from '../../shared/constants';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import VerificationPendingBanner from '../Auth/VerificationPendingBanner';
import { SvgIcon } from '../Icons';
import SkipNavLink from '../Shared/SkipNavLink';
import { groupSidebarItems } from '../Sidebar/utils/groupSidebarItems';
import { toNavItems } from '../Sidebar/utils/toNavItems';
import Topbar from '../Topbar/Topbar';

import type { RootState } from '../../store/reduxStore';

interface Props {
  children?: React.ReactNode;
}

const LAYOUT_TEST_ID = 'protected-layout';
const MAIN_CONTENT_ID = 'main-content';

/**
 * Tablet band for the icon-only collapsed rail: full rail above the tablet
 * breakpoint (desktop), collapsed rail across the tablet band, overlay drawer at
 * phone width — reproducing the app's phone(≤480)/tablet/desktop(>768) scheme.
 */
const COLLAPSED_RAIL_RANGE = { min: PHONE_BREAKPOINT_PX + 1, max: TABLET_BREAKPOINT_PX + 1 };

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flex: 1 },
});

const ProtectedLayout = ({ children }: Props): React.ReactElement => {
  const router = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { darkModePreference, setDarkModePreference } = useTheme();
  const userInfo = useSelector((s: RootState) => s.auth.userInfo);

  const roles = userInfo?.roles;
  const navItems = useMemo<NavItem[]>(
    () => toNavItems(groupSidebarItems(moduleRegistry.getSidebarItemsForRoles(roles ?? []))),
    [roles],
  );

  const isHomeActive = isRouteActive(pathname, Routes.DASHBOARD);

  function handleNavigate(route: string): void {
    router.push(route);
  }
  function handleHome(): void {
    router.push(Routes.DASHBOARD);
  }
  function handleLogout(): void {
    logout().catch(() => {});
  }

  const renderChevron = (expanded: boolean, color: string, size: number): React.ReactElement => (
    <SvgIcon color={color} name={expanded ? 'chevronUp' : 'chevronDown'} size={size} />
  );

  const footerProps = { darkModePreference, onDarkModeChange: setDarkModePreference, onLogout: handleLogout };

  return (
    <View style={styles.root}>
      <SkipNavLink targetId={MAIN_CONTENT_ID} />
      <NavShell
        banner={<VerificationPendingBanner />}
        contentPadding={0}
        header={<Topbar showAccountButton={false} />}
        layout="side"
        mobileMenu={{
          openLabel: FM('topbar.menu'),
          openHint: FM('topbar.menuHint'),
          closeLabel: FM('layout.closeSidebar'),
          closeHint: FM('layout.closeSidebarHint'),
        }}
        navigateHint={(label) => FM('menu.navigateToHint', label)}
        pathname={pathname}
        regionLabel={FM('accessibility.navigationRegion')}
        sideRail={{
          items: navItems,
          title: FM('menu.title'),
          header: <SidebarHomeLink active={isHomeActive} onPress={handleHome} />,
          footer: <SidebarFooter {...footerProps} />,
          expandHint: FM('menu.expandSection'),
          collapseHint: FM('menu.collapseSection'),
          renderChevron,
          collapsed: {
            items: navItems,
            header: <SidebarHomeLink collapsed active={isHomeActive} onPress={handleHome} />,
            footer: <SidebarFooter collapsed {...footerProps} />,
            range: COLLAPSED_RAIL_RANGE,
          },
        }}
        testID={LAYOUT_TEST_ID}
        onNavigate={handleNavigate}
      >
        <View nativeID={MAIN_CONTENT_ID} style={styles.content} testID={TestIds.MAIN_CONTENT_REGION}>
          {children}
        </View>
      </NavShell>
    </View>
  );
};

export default ProtectedLayout;
