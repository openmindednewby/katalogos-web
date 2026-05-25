/**
 * Compact dark mode toggle for the sidebar.
 * Displays three segmented buttons for Light / Dark / System.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '../../localization/helpers';
import DarkModePreference from '../../shared/enums/DarkModePreference';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { SvgIcon } from '../Icons';

import type { IconName } from '../Icons';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const ICON_SIZE = 14;
const BORDER_WIDTH = 1;
const BORDER_RADIUS = 6;
const ACTIVE_OPACITY = 0.15;

interface ModeOption {
  preference: DarkModePreference;
  labelKey: string;
  hintKey: string;
  icon: IconName;
  testID: string;
}

const MODE_OPTIONS: readonly ModeOption[] = [
  {
    preference: DarkModePreference.Light,
    labelKey: 'darkModeToggle.light',
    hintKey: 'darkModeToggle.lightHint',
    icon: 'sun',
    testID: TestIds.DARK_MODE_OPTION_LIGHT,
  },
  {
    preference: DarkModePreference.Dark,
    labelKey: 'darkModeToggle.dark',
    hintKey: 'darkModeToggle.darkHint',
    icon: 'moon',
    testID: TestIds.DARK_MODE_OPTION_DARK,
  },
  {
    preference: DarkModePreference.System,
    labelKey: 'darkModeToggle.system',
    hintKey: 'darkModeToggle.systemHint',
    icon: 'monitor',
    testID: TestIds.DARK_MODE_OPTION_SYSTEM,
  },
] as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 6,
    paddingVertical: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  segmentRow: {
    flexDirection: 'row',
    borderWidth: BORDER_WIDTH,
    borderRadius: BORDER_RADIUS,
    overflow: 'hidden',
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    gap: 4,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '500',
  },
});

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const HEX_R_START = 1;
const HEX_R_END = 3;
const HEX_G_END = 5;
const HEX_B_END = 7;
const HEX_RADIX = 16;

function buildActiveBackground(primaryColor: string): string {
  // Convert hex to rgba for the active segment highlight
  const r = parseInt(primaryColor.slice(HEX_R_START, HEX_R_END), HEX_RADIX);
  const g = parseInt(primaryColor.slice(HEX_R_END, HEX_G_END), HEX_RADIX);
  const b = parseInt(primaryColor.slice(HEX_G_END, HEX_B_END), HEX_RADIX);
  return `rgba(${String(r)}, ${String(g)}, ${String(b)}, ${String(ACTIVE_OPACITY)})`;
}

const DarkModeToggle = (): React.ReactElement => {
  const { theme, darkModePreference, setDarkModePreference } = useTheme();
  const colors = theme.colors;

  const activeBackground = useMemo(
    () => buildActiveBackground(theme.palette.primary[500]),
    [theme.palette.primary],
  );

  return (
    <View style={styles.container} testID={TestIds.DARK_MODE_TOGGLE}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {FM('darkModeToggle.label')}
      </Text>
      <View style={[styles.segmentRow, { borderColor: colors.border }]}>
        {MODE_OPTIONS.map((option) => {
          const isActive = darkModePreference === option.preference;

          return (
            <TouchableOpacity
              key={option.preference}
              accessibilityHint={FM(option.hintKey)}
              accessibilityLabel={FM(option.labelKey)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              style={[
                styles.segment,
                { backgroundColor: isActive ? activeBackground : colors.surface },
              ]}
              testID={option.testID}
              onPress={() => setDarkModePreference(option.preference)}
            >
              <SvgIcon
                color={isActive ? colors.text : colors.textSecondary}
                name={option.icon}
                size={ICON_SIZE}
              />
              <Text
                style={[
                  styles.segmentText,
                  { color: isActive ? colors.text : colors.textSecondary },
                ]}
              >
                {FM(option.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default DarkModeToggle;
