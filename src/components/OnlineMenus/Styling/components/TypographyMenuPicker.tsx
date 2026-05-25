

// =============================================================================
// Component
// =============================================================================

import React, { useCallback, useMemo, useRef, useState } from 'react';

import { Modal, Pressable, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import { hasExactFontMatch } from '../utils/typographyConstants';
import { typographyEditorStyles as styles } from '../utils/typographyEditorStyles';

// =============================================================================
// Types
// =============================================================================

interface MenuOption {
  label: string;
  value: string;
}

export interface TypographyMenuPickerProps {
  label: string;
  currentLabel: string;
  options: readonly MenuOption[];
  onSelect: (option: MenuOption) => void;
  disabled: boolean;
  textColor: string;
  textSecondary: string;
  borderColor: string;
  bgColor: string;
  testID: string;
  accessibilityLabel: string;
  accessibilityHint: string;
  /** When true, shows a "Use custom font" option when search text has no exact match */
  allowCustom?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const DROPDOWN_ARROW = '\u25BC';

// =============================================================================
// Helpers
// =============================================================================

function buildHighlightedLabel(label: string, search: string, textColor: string): React.JSX.Element {
  if (search === '') return <Text style={[styles.menuItemText, { color: textColor }]}>{label}</Text>;

  const lowerLabel = label.toLowerCase();
  const lowerSearch = search.toLowerCase();
  const matchIndex = lowerLabel.indexOf(lowerSearch);

  if (matchIndex < 0) return <Text style={[styles.menuItemText, { color: textColor }]}>{label}</Text>;

  const before = label.slice(0, matchIndex);
  const match = label.slice(matchIndex, matchIndex + search.length);
  const after = label.slice(matchIndex + search.length);

  return (
    <Text style={[styles.menuItemText, { color: textColor }]}>
      {before}
      <Text style={styles.menuItemHighlight}>{match}</Text>
      {after}
    </Text>
  );
}

// =============================================================================
// Component
// =============================================================================

export const TypographyMenuPicker = ({
  label,
  currentLabel,
  options,
  onSelect,
  disabled,
  textColor,
  textSecondary,
  borderColor,
  bgColor,
  testID,
  accessibilityLabel,
  accessibilityHint,
  allowCustom = false,
}: TypographyMenuPickerProps): React.JSX.Element => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const dialogRef = useRef<View>(null);
  useFocusTrap(dialogRef, menuVisible);

  const filteredOptions = useMemo(() => {
    if (searchText === '') return [...options];
    const lowerSearch = searchText.toLowerCase();
    return options.filter((opt) => opt.label.toLowerCase().includes(lowerSearch));
  }, [options, searchText]);

  const shouldShowCustomOption = allowCustom && searchText !== '' && !hasExactFontMatch(searchText);

  const handleSelect = useCallback(
    (option: MenuOption): void => {
      setMenuVisible(false);
      setSearchText('');
      onSelect(option);
    },
    [onSelect],
  );

  const handleCustomSelect = useCallback((): void => {
    const customOption: MenuOption = { label: searchText, value: searchText };
    handleSelect(customOption);
  }, [searchText, handleSelect]);

  const handleClose = useCallback((): void => {
    setMenuVisible(false);
    setSearchText('');
  }, []);

  const handleOpen = useCallback((): void => {
    setMenuVisible(true);
    setSearchText('');
  }, []);

  return (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: textSecondary }]}>
        {label}
      </Text>
      <Pressable
        accessibilityHint={accessibilityHint}
        accessibilityLabel={accessibilityLabel}
        accessibilityRole="combobox"
        disabled={disabled}
        style={[
          styles.pickerContainer,
          { borderColor, backgroundColor: bgColor },
          disabled && styles.disabledInput,
        ]}
        testID={testID}
        onPress={handleOpen}
      >
        <Text style={[styles.picker, styles.pickerText, { color: textColor }]}>
          {currentLabel}
        </Text>
        <Text style={{ color: textColor }}>{DROPDOWN_ARROW}</Text>
      </Pressable>
      <Modal transparent animationType="fade" visible={menuVisible} onRequestClose={handleClose}>
        <TouchableOpacity accessibilityRole="button" activeOpacity={1} style={styles.menuOverlay} onPress={handleClose}>
          <View
            ref={dialogRef}
            accessibilityViewIsModal
            aria-label={label}
            role="dialog"
            style={[styles.menuContent, { backgroundColor: bgColor, borderColor }]}
          >
            <TextInput
              autoFocus
              accessibilityHint={FM('onlineMenus.display.searchOptionsHint')}
              accessibilityLabel={FM('onlineMenus.display.searchOptionsLabel')}
              placeholder={FM('common.search')}
              placeholderTextColor={textSecondary}
              style={[styles.menuSearchInput, { color: textColor, borderColor }]}
              testID={`${testID}-search`}
              value={searchText}
              onChangeText={setSearchText}
            />
            <ScrollView keyboardShouldPersistTaps="handled" style={styles.menuScrollView}>
              {filteredOptions.map((option) => (
                <Pressable
                  key={option.value}
                  accessibilityRole="button"
                  style={styles.menuItem}
                  onPress={() => handleSelect(option)}
                >
                  {buildHighlightedLabel(option.label, searchText, textColor)}
                </Pressable>
              ))}
              {shouldShowCustomOption ? (
                <Pressable
                  accessibilityRole="button"
                  style={styles.menuItem}
                  testID={`${testID}-custom-option`}
                  onPress={handleCustomSelect}
                >
                  <Text style={[styles.menuItemText, styles.menuCustomOptionText, { color: textColor }]}>
                    {FM('typography.useCustomFont', searchText)}
                  </Text>
                </Pressable>
              ) : null}
              {filteredOptions.length === 0 && !shouldShowCustomOption ? (
                <Text style={[styles.menuNoResults, { color: textSecondary }]}>
                  {FM('common.noResults')}
                </Text>
              ) : null}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};
