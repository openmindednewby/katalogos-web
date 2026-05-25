/**
 * Compact language dropdown for the public menu.
 * Only renders when translated languages are available.
 *
 * WCAG: Escape closes the dropdown, accessibilityState reflects expanded state.
 */
import React, { useCallback, useState } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';

import { useEscapeKey } from '../../../hooks/useEscapeKey';

const DROPDOWN_SHADOW_OPACITY = 0.15;
const DROPDOWN_SHADOW_RADIUS = 8;
const DROPDOWN_ELEVATION = 4;
const OPTION_PADDING_V = 10;
const OPTION_PADDING_H = 16;
const BACKDROP_EXTEND = 9999;

const styles = StyleSheet.create({
  container: { position: 'relative', zIndex: 1000 },
  backdrop: {
    position: 'absolute',
    top: -BACKDROP_EXTEND,
    left: -BACKDROP_EXTEND,
    right: -BACKDROP_EXTEND,
    bottom: -BACKDROP_EXTEND,
  },
  trigger: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1 },
  triggerText: { fontSize: 14, fontWeight: '500' },
  dropdown: {
    position: 'absolute', top: '100%', right: 0, marginTop: 4, borderRadius: 8, borderWidth: 1,
    shadowOpacity: DROPDOWN_SHADOW_OPACITY, shadowRadius: DROPDOWN_SHADOW_RADIUS, elevation: DROPDOWN_ELEVATION, zIndex: 1000, minWidth: 160,
  },
  option: { paddingVertical: OPTION_PADDING_V, paddingHorizontal: OPTION_PADDING_H },
  optionText: { fontSize: 14 },
  selectedOption: { fontWeight: '700' },
});

interface LanguageOption {
  code: string;
  name: string;
}

interface Props {
  availableLanguages: LanguageOption[];
  currentLanguage: string;
  surfaceColor: string;
  textColor: string;
  borderColor: string;
  accentColor: string;
  onLanguageChange: (code: string) => void;
}

export const LanguageSwitcher: React.FC<Props> = ({
  availableLanguages,
  currentLanguage,
  surfaceColor,
  textColor,
  borderColor,
  accentColor,
  onLanguageChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = useCallback(() => { setIsOpen((prev) => !prev); }, []);
  const handleClose = useCallback(() => { setIsOpen(false); }, []);

  const handleSelect = useCallback((code: string) => {
    onLanguageChange(code);
    setIsOpen(false);
  }, [onLanguageChange]);

  useEscapeKey(handleClose, isOpen);

  if (availableLanguages.length === 0) return null;

  const currentOption = availableLanguages.find((l) => l.code === currentLanguage);
  const displayName = currentOption?.name ?? FM('translations.originalLanguage');

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityHint={FM('translations.languageSwitcherHint')}
        accessibilityLabel={FM('translations.languageSwitcher')}
        accessibilityState={{ expanded: isOpen }}
        style={[styles.trigger, { borderColor, backgroundColor: surfaceColor }]}
        testID={TestIds.LANGUAGE_SWITCHER}
        onPress={handleToggle}
      >
        <Text style={[styles.triggerText, { color: textColor }]}>{displayName}</Text>
      </TouchableOpacity>

      {isOpen ? (
        <>
        <TouchableOpacity
          accessibilityHint={FM('publicMenu.dropdown.backdropHint')}
          accessibilityLabel={FM('publicMenu.dropdown.backdropLabel')}
          activeOpacity={1}
          style={styles.backdrop}
          testID={TestIds.PUBLIC_MENU_LANGUAGE_BACKDROP}
          onPress={handleClose}
        />
        <View accessibilityRole="menu" style={[styles.dropdown, { backgroundColor: surfaceColor, borderColor }]}>
          <TouchableOpacity
            accessibilityHint={FM('translations.languageSwitcherHint')}
            accessibilityLabel={FM('translations.originalLanguage')}
            accessibilityRole="menuitem"
            accessibilityState={{ selected: currentLanguage === '' }}
            style={styles.option}
            testID={`${TestIds.LANGUAGE_SWITCHER_OPTION}-original`}
            onPress={() => { handleSelect(''); }}
          >
            <Text style={[
              styles.optionText,
              { color: currentLanguage === '' ? accentColor : textColor },
              currentLanguage === '' ? styles.selectedOption : undefined,
            ]}>
              {FM('translations.originalLanguage')}
            </Text>
          </TouchableOpacity>

          {availableLanguages.map((lang) => (
            <TouchableOpacity
              key={lang.code}
              accessibilityHint={FM('translations.languageSwitcherHint')}
              accessibilityLabel={lang.name}
              accessibilityRole="menuitem"
              accessibilityState={{ selected: currentLanguage === lang.code }}
              style={styles.option}
              testID={`${TestIds.LANGUAGE_SWITCHER_OPTION}-${lang.code}`}
              onPress={() => { handleSelect(lang.code); }}
            >
              <Text style={[
                styles.optionText,
                { color: currentLanguage === lang.code ? accentColor : textColor },
                currentLanguage === lang.code ? styles.selectedOption : undefined,
              ]}>
                {lang.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        </>
      ) : null}
    </View>
  );
};
