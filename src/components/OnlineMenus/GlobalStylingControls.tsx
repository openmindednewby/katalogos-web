import React, { useEffect, useState } from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import ThemeMode from '../../shared/enums/ThemeMode';
import { TestIds } from '../../shared/testIds';
import { themePalette } from '../../theme/utils/styles';

import type { RootState } from '../../store/reduxStore';

const DEFAULT_TITLE_FONT_SIZE = 32;

interface GlobalStylingControlsProps {
  backgroundColor?: string | null;
  textColor?: string | null;
  titleFontSize?: number;
  onBackgroundColorChange: (color: string) => void;
  onTextColorChange: (color: string) => void;
  onTitleFontSizeChange: (size: number) => void;
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  colorInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorPreview: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
  },
  colorInput: {
    flex: 1,
  },
});

const GlobalStylingControls: React.FC<GlobalStylingControlsProps> = ({
  backgroundColor,
  textColor,
  titleFontSize,
  onBackgroundColorChange,
  onTextColorChange,
  onTitleFontSizeChange,
}) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const borderColor = String(colors.border);
  const textColorValue = String(colors.text);
  const bgColorValue = String(colors.surface);
  const textSecondary = String(colors.textSecondary);

  const currentBgColor = backgroundColor ?? String(colors.background);
  const currentTextColor = textColor ?? String(colors.text);
  const currentFontSize = titleFontSize ?? DEFAULT_TITLE_FONT_SIZE;

  const [fontSizeText, setFontSizeText] = useState(String(currentFontSize));

  useEffect(() => {
    setFontSizeText(String(currentFontSize));
  }, [currentFontSize]);

  const handleFontSizeBlur = (): void => {
    const MIN_FONT_SIZE = 1;
    const parsed = parseInt(fontSizeText, 10);
    if (!isNaN(parsed) && parsed >= MIN_FONT_SIZE)
      onTitleFontSizeChange(parsed);
    else
      setFontSizeText(String(currentFontSize));
  };

  return (
    <View style={styles.container}>
      {/* Background Color */}
      <Text style={[styles.label, { color: textColorValue }]}>
        {FM('onlineMenus.backgroundColor')}
      </Text>
      <View style={styles.colorInputContainer}>
        <View
          style={[
            styles.colorPreview,
            { backgroundColor: currentBgColor, borderColor },
          ]}
        />
        <TextInput
          accessibilityHint={FM('globalStyling.bgColorHint')}
          accessibilityLabel={FM('globalStyling.bgColorLabel')}
          placeholder="#FFFFFF"
          placeholderTextColor={textSecondary}
          style={[
            styles.input,
            styles.colorInput,
            { borderColor, color: textColorValue, backgroundColor: bgColorValue },
          ]}
          testID={TestIds.MENU_EDITOR_BG_COLOR_PICKER}
          value={currentBgColor}
          onChangeText={onBackgroundColorChange}
        />
      </View>

      {/* Text Color */}
      <Text style={[styles.label, { color: textColorValue }]}>
        {FM('onlineMenus.textColor')}
      </Text>
      <View style={styles.colorInputContainer}>
        <View
          style={[
            styles.colorPreview,
            { backgroundColor: currentTextColor, borderColor },
          ]}
        />
        <TextInput
          accessibilityHint={FM('globalStyling.textColorHint')}
          accessibilityLabel={FM('globalStyling.textColorLabel')}
          placeholder="#000000"
          placeholderTextColor={textSecondary}
          style={[
            styles.input,
            styles.colorInput,
            { borderColor, color: textColorValue, backgroundColor: bgColorValue },
          ]}
          testID={TestIds.MENU_EDITOR_TEXT_COLOR_PICKER}
          value={currentTextColor}
          onChangeText={onTextColorChange}
        />
      </View>

      {/* Title Font Size */}
      <Text style={[styles.label, { color: textColorValue }]}>
        {FM('onlineMenus.titleFontSize')}
      </Text>
      <TextInput
        accessibilityHint={FM('globalStyling.titleFontSizeHint')}
        accessibilityLabel={FM('globalStyling.titleFontSizeLabel')}
        keyboardType="number-pad"
        placeholder="32"
        placeholderTextColor={textSecondary}
        style={[
          styles.input,
          { borderColor, color: textColorValue, backgroundColor: bgColorValue },
        ]}
        testID={TestIds.MENU_EDITOR_TITLE_FONT_SIZE_INPUT}
        value={fontSizeText}
        onBlur={handleFontSizeBlur}
        onChangeText={setFontSizeText}
      />
    </View>
  );
};

export default GlobalStylingControls;
