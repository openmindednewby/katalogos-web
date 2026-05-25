


// =============================================================================
// Font Weight Control
// =============================================================================

import React, { useRef } from 'react';

import { Modal, Pressable, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useFocusTrap } from '../../../../hooks/useFocusTrap';
import { TestIds } from '../../../../shared/testIds';
import { isValidHexColor, INVALID_COLOR_SWATCH } from '../utils/colorSchemeConstants';
import { FONT_WEIGHT_OPTIONS, getFontWeightLabel } from '../utils/priceStyleConstants';
import { priceStyleEditorStyles as styles } from '../utils/priceStyleEditorStyles';

import type { FontWeight } from '../../../../types/menuStyleTypes';

const DROPDOWN_ARROW = '\u25BC';

interface FontWeightControlProps {
  value: FontWeight;
  onChange: (value: FontWeight) => void;
  disabled: boolean;
  menuVisible: boolean;
  setMenuVisible: (visible: boolean) => void;
  textColor: string;
  borderColor: string;
  bgColor: string;
}

export const FontWeightControl: React.FC<FontWeightControlProps> = ({
  value,
  onChange,
  disabled,
  menuVisible,
  setMenuVisible,
  textColor,
  borderColor,
  bgColor,
}) => {
  const dialogRef = useRef<View>(null);
  useFocusTrap(dialogRef, menuVisible);

  const handleSelect = (fontWeight: FontWeight): void => {
    setMenuVisible(false);
    onChange(fontWeight);
  };

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: textColor }]}>
        {FM('priceStyle.fontWeight')}
      </Text>
      <View style={styles.dropdownContainer}>
        <Pressable
          accessibilityHint={FM('priceStyle.fontWeightHint')}
          accessibilityLabel={FM('priceStyle.fontWeightLabel')}
          accessibilityRole="combobox"
          disabled={disabled}
          style={[
            styles.dropdownButton,
            { borderColor, backgroundColor: bgColor },
            disabled && styles.dropdownButtonDisabled,
          ]}
          testID={TestIds.PRICE_STYLE_FONT_WEIGHT_DROPDOWN}
          onPress={() => setMenuVisible(true)}
        >
          <Text style={[styles.dropdownText, { color: textColor }]}>
            {getFontWeightLabel(value)}
          </Text>
          <Text style={{ color: textColor }}>{DROPDOWN_ARROW}</Text>
        </Pressable>
        <Modal transparent animationType="fade" visible={menuVisible} onRequestClose={() => setMenuVisible(false)}>
          <TouchableOpacity accessibilityRole="button" activeOpacity={1} style={styles.menuOverlay} onPress={() => setMenuVisible(false)}>
            <View
              ref={dialogRef}
              accessibilityViewIsModal
              aria-label={FM('priceStyle.fontWeight')}
              role="dialog"
              style={[styles.menuContent, { backgroundColor: bgColor, borderColor }]}
            >
              {FONT_WEIGHT_OPTIONS.map((option) => (
                <Pressable key={option.value} accessibilityRole="button" style={styles.menuItem} onPress={() => handleSelect(option.value)}>
                  <Text style={[styles.menuItemText, { color: textColor }]}>{option.label}</Text>
                </Pressable>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </View>
  );
};

// =============================================================================
// Color Input Control
// =============================================================================

interface ColorInputControlProps {
  value: string;
  onChange: (value: string) => void;
  hasError: boolean;
  disabled: boolean;
  textColor: string;
  textSecondary: string;
  borderColor: string;
  bgColor: string;
  errorColor: string;
}

export const ColorInputControl: React.FC<ColorInputControlProps> = ({
  value,
  onChange,
  hasError,
  disabled,
  textColor,
  textSecondary,
  borderColor,
  bgColor,
  errorColor,
}) => {
  const swatchColor = isValidHexColor(value) ? value : INVALID_COLOR_SWATCH;

  return (
    <View style={styles.row}>
      <Text style={[styles.label, { color: textColor }]}>
        {FM('priceStyle.color')}
      </Text>
      <View style={styles.colorRow}>
        <View
          style={[styles.colorSwatch, { backgroundColor: swatchColor, borderColor }]}
          testID={TestIds.PRICE_STYLE_COLOR_SWATCH}
        />
        <View style={styles.colorInputWrapper}>
          <TextInput
            accessibilityHint={FM('priceStyle.colorHint')}
            accessibilityLabel={FM('priceStyle.colorLabel')}
            autoCapitalize="characters"
            editable={!disabled}
            placeholder="#000000"
            placeholderTextColor={textSecondary}
            style={[
              styles.colorInput,
              { borderColor: hasError ? errorColor : borderColor, color: textColor, backgroundColor: bgColor },
            ]}
            testID={TestIds.PRICE_STYLE_COLOR_INPUT}
            value={value}
            onChangeText={onChange}
          />
          {hasError ? (
            <Text style={[styles.errorText, { color: errorColor }]}>
              {FM('priceStyle.invalidHex')}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
};
