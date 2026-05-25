

import React, { useCallback, useState } from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import ColorInputRow from './ColorInputRow';
import ColorPresetCard from './ColorPresetCard';
import ThemeMode from '../../../../shared/enums/ThemeMode';
import { TestIds } from '../../../../shared/testIds';
import { themePalette } from '../../../../theme/utils/styles';
import {
  COLOR_PRESETS,
  COLOR_PROPERTY_KEYS,
  isValidHexColor,
} from '../utils/colorSchemeConstants';
import { colorSchemeEditorStyles as styles } from '../utils/colorSchemeEditorStyles';

import type { RootState } from '../../../../store/reduxStore';
import type { ColorPreset, ColorScheme } from '../utils/colorSchemeConstants';

interface Props {
  value: ColorScheme;
  onChange: (colorScheme: ColorScheme) => void;
  onReset?: () => void;
  disabled?: boolean;
}

const ColorSchemeEditor: React.FC<Props> = ({
  value,
  onChange,
  onReset,
  disabled = false,
}) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const [errors, setErrors] = useState<Partial<Record<keyof ColorScheme, boolean>>>({});

  const textColor = String(colors.text);
  const textSecondary = String(colors.subtext);
  const borderColor = String(colors.border);
  const bgColor = String(colors.surface);
  const errorColor = String(colors.error);

  const handleColorChange = useCallback(
    (key: keyof ColorScheme, newColor: string) => {
      const isValid = newColor === '' || isValidHexColor(newColor.toUpperCase());
      setErrors((prev) => ({ ...prev, [key]: !isValid && newColor !== '' }));
      onChange({ ...value, [key]: newColor });
    },
    [onChange, value],
  );

  const handlePresetSelect = useCallback(
    (preset: ColorPreset) => {
      if (disabled) return;
      setErrors({});
      onChange(preset.scheme);
    },
    [onChange, disabled],
  );

  const handleReset = useCallback(() => {
    if (disabled || !onReset) return;
    setErrors({});
    onReset();
  }, [onReset, disabled]);

  return (
    <View style={styles.container} testID={TestIds.COLOR_SCHEME_EDITOR}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        {FM('colorScheme.title')}
      </Text>

      <View style={styles.presetsContainer}>
        <Text style={[styles.presetsLabel, { color: textSecondary }]}>
          {FM('colorScheme.presets')}
        </Text>
        <ScrollView
          horizontal
          contentContainerStyle={styles.presetsScrollContent}
          showsHorizontalScrollIndicator={false}
          style={styles.presetsScrollView}
        >
          {COLOR_PRESETS.map((preset) => (
            <ColorPresetCard
              key={preset.key}
              accessibilityHint={FM('colorScheme.presetHint', preset.name)}
              accessibilityLabel={FM('colorScheme.presetLabel', preset.name)}
              borderColor={borderColor}
              disabled={disabled}
              preset={preset}
              onPress={() => handlePresetSelect(preset)}
            />
          ))}
        </ScrollView>
      </View>

      <View style={styles.colorsContainer}>
        {COLOR_PROPERTY_KEYS.map((key) => (
          <ColorInputRow
            key={key}
            accessibilityHint={FM('colorScheme.inputHint', value[key] ?? '')}
            accessibilityLabel={FM('colorScheme.inputLabel', key)}
            bgColor={bgColor}
            borderColor={borderColor}
            colorKey={key}
            currentColor={value[key] ?? ''}
            disabled={disabled}
            errorColor={errorColor}
            errorMessage={FM('colorScheme.invalidHex')}
            hasError={errors[key] ?? false}
            label={FM(`colorScheme.${key}`)}
            textColor={textColor}
            textSecondary={textSecondary}
            onColorChange={handleColorChange}
          />
        ))}
      </View>

      {onReset ? (
        <View style={styles.resetContainer}>
          <TouchableOpacity
            accessibilityHint={FM('colorScheme.resetHint')}
            accessibilityLabel={FM('colorScheme.resetLabel')}
            accessibilityRole="button"
            disabled={disabled}
            style={[styles.resetButton, { borderColor }, disabled && styles.resetButtonDisabled]}
            testID={TestIds.COLOR_SCHEME_RESET_BUTTON}
            onPress={handleReset}
          >
            <Text style={[styles.resetButtonText, { color: textColor }]}>
              {FM('colorScheme.reset')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default ColorSchemeEditor;

export { COLOR_PRESETS, isValidHexColor } from '../utils/colorSchemeConstants';
export type { ColorScheme } from '../utils/colorSchemeConstants';
