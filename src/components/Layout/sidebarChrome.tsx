/**
 * Sidebar chrome slots for the shared NavShell side rail — the Home shortcut and
 * the footer (Appearance control + Logout), each in a full (text) and a collapsed
 * (icon-only) variant. Extracted so `ProtectedLayout` stays a thin NavShell wiring.
 *
 * The dark-mode control is the shared `@dloizides/ui-nav` `DarkModeControl`
 * (segmented on the full rail, cycle on the collapsed rail); logout keeps the
 * `LOGOUT_BUTTON` testID that the E2E suite AND the global logout listener in
 * `AuthProvider` key off. All colours flow through the app theme.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { DarkModeControl, type DarkModeOption } from '@dloizides/ui-nav';

import { FM } from '../../localization/helpers';
import DarkModePreference from '../../shared/enums/DarkModePreference';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { SvgIcon } from '../Icons';

const HOME_ICON_SIZE = 22;
const FOOTER_ICON_SIZE = 18;
const ITEM_BORDER_RADIUS = 4;
const ICON_ITEM_SIZE = 48;
const ICON_ITEM_RADIUS = 8;
const ITEM_PADDING_VERTICAL = 10;
const ITEM_PADDING_HORIZONTAL = 6;
const FOOTER_GAP = 8;
const ICON_ITEM_MARGIN = 4;

const styles = StyleSheet.create({
  item: { paddingVertical: ITEM_PADDING_VERTICAL, paddingHorizontal: ITEM_PADDING_HORIZONTAL, borderRadius: ITEM_BORDER_RADIUS },
  itemText: { fontSize: 16 },
  iconItem: {
    width: ICON_ITEM_SIZE,
    height: ICON_ITEM_SIZE,
    marginVertical: ICON_ITEM_MARGIN,
    borderRadius: ICON_ITEM_RADIUS,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerColumn: { gap: FOOTER_GAP },
});

/** Map a DarkModeControl string value back to the app's `DarkModePreference` (no unsafe cast). */
const PREFERENCE_BY_VALUE: Record<string, DarkModePreference> = {
  [DarkModePreference.Light]: DarkModePreference.Light,
  [DarkModePreference.Dark]: DarkModePreference.Dark,
  [DarkModePreference.System]: DarkModePreference.System,
};

function toPreference(value: string): DarkModePreference {
  return PREFERENCE_BY_VALUE[value] ?? DarkModePreference.System;
}

interface HomeLinkProps {
  active: boolean;
  collapsed?: boolean;
  onPress: () => void;
}

/** Home shortcut rendered in the rail header slot (text on the full rail, icon on the collapsed rail). */
export const SidebarHomeLink = ({ active, collapsed = false, onPress }: HomeLinkProps): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primaryColor = theme.palette.primary['500'];

  if (collapsed)
    return (
      <TouchableOpacity
        accessibilityHint={FM('menu.homeHint')}
        accessibilityLabel={FM('menu.home')}
        accessibilityRole="button"
        style={[styles.iconItem, active ? { backgroundColor: colors.border } : undefined]}
        testID={TestIds.NAV_HOME}
        onPress={onPress}
      >
        <SvgIcon color={active ? primaryColor : colors.textSecondary} name="home" size={HOME_ICON_SIZE} />
      </TouchableOpacity>
    );

  return (
    <TouchableOpacity
      accessibilityHint={FM('menu.homeHint')}
      accessibilityLabel={FM('menu.home')}
      accessibilityRole="button"
      style={[styles.item, active ? { backgroundColor: colors.border } : undefined]}
      testID={TestIds.NAV_HOME}
      onPress={onPress}
    >
      <Text style={[styles.itemText, { color: active ? primaryColor : colors.text }]}>{FM('menu.home')}</Text>
    </TouchableOpacity>
  );
};

/** Build the pre-localized Light / Dark / System options for the shared DarkModeControl. */
function useDarkModeOptions(): DarkModeOption[] {
  return useMemo(
    () => [
      {
        value: DarkModePreference.Light,
        label: FM('darkModeToggle.light'),
        hint: FM('darkModeToggle.lightHint'),
        renderIcon: (color, size) => <SvgIcon color={color} name="sun" size={size} />,
      },
      {
        value: DarkModePreference.Dark,
        label: FM('darkModeToggle.dark'),
        hint: FM('darkModeToggle.darkHint'),
        renderIcon: (color, size) => <SvgIcon color={color} name="moon" size={size} />,
      },
      {
        value: DarkModePreference.System,
        label: FM('darkModeToggle.system'),
        hint: FM('darkModeToggle.systemHint'),
        renderIcon: (color, size) => <SvgIcon color={color} name="monitor" size={size} />,
      },
    ],
    [],
  );
}

interface FooterProps {
  collapsed?: boolean;
  darkModePreference: DarkModePreference;
  onDarkModeChange: (preference: DarkModePreference) => void;
  onLogout: () => void;
}

/** Rail footer: the shared appearance control + a logout button (both variants preserve testIDs). */
export const SidebarFooter = ({ collapsed = false, darkModePreference, onDarkModeChange, onLogout }: FooterProps): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const options = useDarkModeOptions();

  return (
    <View style={collapsed ? undefined : styles.footerColumn}>
      <DarkModeControl
        options={options}
        regionLabel={FM('darkModeToggle.label')}
        testID={TestIds.DARK_MODE_TOGGLE}
        value={darkModePreference}
        variant={collapsed ? 'cycle' : 'segmented'}
        onChange={(value) => onDarkModeChange(toPreference(value))}
      />
      <TouchableOpacity
        accessible
        accessibilityHint={FM('topbar.logoutHint')}
        accessibilityLabel={FM('topbar.logout')}
        accessibilityRole="button"
        style={collapsed ? styles.iconItem : styles.item}
        testID={TestIds.LOGOUT_BUTTON}
        onPress={onLogout}
      >
        {collapsed ? (
          <SvgIcon color={colors.text} name="logout" size={FOOTER_ICON_SIZE} />
        ) : (
          <Text style={[styles.itemText, { color: colors.text }]}>{FM('topbar.logout')}</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};
