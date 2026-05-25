

/**
 * BorderColorInput Component
 *
 * A color input field with validation and visual swatch preview.
 * Handles hex color validation and displays error state.
 */
import React, { useCallback, useState } from 'react';

import { Text, TextInput, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { INVALID_COLOR_SWATCH, isValidHexColor } from '../utils/boxStyleEditorConstants';
import { boxStyleEditorStyles as styles } from '../utils/boxStyleEditorStyles';

// =============================================================================
// Types
// =============================================================================

interface Props {
  value: string;
  onChange: (color: string) => void;
  disabled?: boolean;
  textColor: string;
  textSecondary: string;
  borderColor: string;
  bgColor: string;
  errorColor: string;
}

// =============================================================================
// Component
// =============================================================================

const BorderColorInput: React.FC<Props> = ({
  bgColor,
  borderColor,
  disabled = false,
  errorColor,
  onChange,
  textColor,
  textSecondary,
  value,
}) => {
  const [hasError, setHasError] = useState(false);

  const handleChange = useCallback(
    (newColor: string) => {
      const isValid = newColor === '' || isValidHexColor(newColor.toUpperCase());
      setHasError(!isValid && newColor !== '');
      onChange(newColor);
    },
    [onChange],
  );

  const swatchColor = isValidHexColor(value) ? value : INVALID_COLOR_SWATCH;

  const inputBorderStyle: ViewStyle = {
    borderColor: hasError ? errorColor : borderColor,
    backgroundColor: bgColor,
  };
  const inputTextStyle: TextStyle = {
    color: textColor,
  };

  return (
    <View style={styles.colorInputRow} testID={`${TestIds.BOX_STYLE_BORDER_COLOR_INPUT}-row`}>
      <Text style={[styles.colorLabel, { color: textColor }]}>
        {FM('boxStyle.borderColor')}
      </Text>
      <View
        style={[styles.colorSwatch, { backgroundColor: swatchColor, borderColor }]}
        testID={TestIds.BOX_STYLE_BORDER_COLOR_SWATCH}
      />
      <View style={styles.colorInputWrapper}>
        <TextInput
          accessibilityHint={FM('boxStyle.borderColorHint')}
          accessibilityLabel={FM('boxStyle.borderColorLabel')}
          autoCapitalize="characters"
          editable={!disabled}
          placeholder="#E0E0E0"
          placeholderTextColor={textSecondary}
          style={[styles.colorInput, inputBorderStyle, inputTextStyle]}
          testID={TestIds.BOX_STYLE_BORDER_COLOR_INPUT}
          value={value}
          onChangeText={handleChange}
        />
        {hasError ? (
          <Text style={[styles.errorText, { color: errorColor }]}>
            {FM('boxStyle.invalidHex')}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default BorderColorInput;
