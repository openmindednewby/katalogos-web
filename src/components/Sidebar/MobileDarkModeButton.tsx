/**
 * Icon-only dark mode toggle button for the collapsed mobile sidebar.
 * Cycles through Light -> Dark -> System on each press.
 */
import React, { useCallback } from 'react';

import { TouchableOpacity } from 'react-native';

import { FM } from '../../localization/helpers';
import DarkModePreference from '../../shared/enums/DarkModePreference';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';
import { SvgIcon } from '../Icons';

import type { IconName } from '../Icons';

const ICON_SIZE = 18;

const PREFERENCE_CYCLE: readonly DarkModePreference[] = [
  DarkModePreference.Light,
  DarkModePreference.Dark,
  DarkModePreference.System,
];

const PREFERENCE_ICON_MAP: Record<DarkModePreference, IconName> = {
  [DarkModePreference.Light]: 'sun',
  [DarkModePreference.Dark]: 'moon',
  [DarkModePreference.System]: 'monitor',
};

const MobileDarkModeButton = (): React.ReactElement => {
  const { theme, darkModePreference, setDarkModePreference } = useTheme();

  const handlePress = useCallback(() => {
    const currentIndex = PREFERENCE_CYCLE.indexOf(darkModePreference);
    const nextIndex = (currentIndex + 1) % PREFERENCE_CYCLE.length;
    setDarkModePreference(PREFERENCE_CYCLE[nextIndex]);
  }, [darkModePreference, setDarkModePreference]);

  return (
    <TouchableOpacity
      accessible
      accessibilityHint={FM('darkModeToggle.toggleHint')}
      accessibilityLabel={FM('darkModeToggle.label')}
      accessibilityRole="button"
      style={layoutStyles.mobileSidebarIconButton}
      testID={TestIds.DARK_MODE_TOGGLE}
      onPress={handlePress}
    >
      <SvgIcon
        color={theme.colors.text}
        name={PREFERENCE_ICON_MAP[darkModePreference]}
        size={ICON_SIZE}
      />
    </TouchableOpacity>
  );
};

export default MobileDarkModeButton;
