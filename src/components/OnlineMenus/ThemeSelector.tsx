import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import ThemeMode from '../../shared/enums/ThemeMode';
import { TestIds } from '../../shared/testIds';
import { themePalette } from '../../theme/utils/styles';

import type { RootState } from '../../store/reduxStore';
import type { MenuContents } from '../../types/menuTypes';

interface ThemeSelectorProps {
  onSelectTheme: (theme: MenuTheme) => void;
  hasPremiumThemes?: boolean;
  onPremiumThemeBlocked?: () => void;
}

export interface MenuTheme {
  name: string;
  titleFont?: string;
  titleFontSize: number;
  backgroundColor: string;
  textColor: string;
}

/** Theme names available on the free tier. */
const FREE_TIER_THEMES = new Set(['light', 'dark']);

const PREDEFINED_THEMES: MenuTheme[] = [
  {
    name: 'light',
    titleFontSize: 32,
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  },
  {
    name: 'dark',
    titleFontSize: 32,
    backgroundColor: '#1A1A1A',
    textColor: '#FFFFFF',
  },
  {
    name: 'elegant',
    titleFontSize: 36,
    backgroundColor: '#F5F5DC',
    textColor: '#2C2C2C',
  },
  {
    name: 'colorful',
    titleFontSize: 32,
    backgroundColor: '#FFE5B4',
    textColor: '#8B4513',
  },
  {
    name: 'minimal',
    titleFontSize: 28,
    backgroundColor: '#FAFAFA',
    textColor: '#333333',
  },
];

const LOCK_ICON = '\uD83D\uDD12';
const CARD_OPACITY_LOCKED = 0.6;
const CARD_OPACITY_NORMAL = 1;

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 12,
  },
  themesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  themeCard: {
    borderRadius: 8,
    padding: 12,
    minWidth: 100,
    alignItems: 'center',
    borderWidth: 2,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

/** Whether a theme requires a premium subscription. */
export function isPremiumTheme(themeName: string): boolean {
  return !FREE_TIER_THEMES.has(themeName);
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  onSelectTheme,
  hasPremiumThemes = true,
  onPremiumThemeBlocked,
}) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const borderColor = String(colors.border);

  const handlePress = useCallback(
    (menuTheme: MenuTheme) => {
      const isLocked = isPremiumTheme(menuTheme.name) && !hasPremiumThemes;
      if (isLocked) {
        onPremiumThemeBlocked?.();
        return;
      }
      onSelectTheme(menuTheme);
    },
    [hasPremiumThemes, onPremiumThemeBlocked, onSelectTheme],
  );

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: String(colors.text) }]}>
        {FM('onlineMenus.theme')}
      </Text>
      <View style={styles.themesContainer}>
        {PREDEFINED_THEMES.map((menuTheme) => {
          const isLocked = isPremiumTheme(menuTheme.name) && !hasPremiumThemes;
          const hint = isLocked
            ? FM('settings.billing.featureGating.premiumThemeLockHint')
            : FM('onlineMenus.themes.applyHint');
          const label = isLocked
            ? FM('settings.billing.featureGating.premiumThemeLockLabel')
            : FM(`onlineMenus.themes.${menuTheme.name}`);

          return (
            <TouchableOpacity
              key={menuTheme.name}
              accessibilityHint={hint}
              accessibilityLabel={label}
              accessibilityRole="button"
              style={[
                styles.themeCard,
                {
                  backgroundColor: menuTheme.backgroundColor,
                  borderColor,
                  opacity: isLocked ? CARD_OPACITY_LOCKED : CARD_OPACITY_NORMAL,
                },
              ]}
              testID={`${TestIds.MENU_EDITOR_THEME_SELECTOR}-${menuTheme.name}`}
              onPress={() => { handlePress(menuTheme); }}
            >
              <Text style={[styles.themeName, { color: menuTheme.textColor }]}>
                {isLocked ? `${LOCK_ICON} ` : ''}{FM(`onlineMenus.themes.${menuTheme.name}`)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default ThemeSelector;

export function applyThemeToMenuContents(
  theme: MenuTheme,
  currentContents: MenuContents | null | undefined,
): MenuContents {
  return {
    ...currentContents,
    titleFont: theme.titleFont,
    titleFontSize: theme.titleFontSize,
    backgroundColor: theme.backgroundColor,
    textColor: theme.textColor,
    categories: currentContents?.categories ?? [],
  };
}
