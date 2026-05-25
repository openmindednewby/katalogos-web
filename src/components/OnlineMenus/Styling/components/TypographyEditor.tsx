

import React, { useCallback } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import { TypographyPreview } from './TypographyPreview';
import { TypographySection } from './TypographySection';
import ThemeMode from '../../../../shared/enums/ThemeMode';
import TypographySectionKey from '../../../../shared/enums/TypographySectionKey';
import { TestIds } from '../../../../shared/testIds';
import { themePalette } from '../../../../theme/utils/styles';
import { typographyEditorStyles as styles } from '../utils/typographyEditorStyles';

import type { RootState } from '../../../../store/reduxStore';
import type { GlobalTypography } from '../../../../types/menuStyleTypes';

// =============================================================================
// Props Interface
// =============================================================================

interface Props {
  value: GlobalTypography;
  onChange: (value: GlobalTypography) => void;
  onReset?: () => void;
  disabled?: boolean;
}

// =============================================================================
// Main Component
// =============================================================================

const TypographyEditor: React.FC<Props> = ({
  value,
  onChange,
  onReset,
  disabled = false,
}) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const textColor = String(colors.text);
  const textSecondary = String(colors.subtext);
  const borderColor = String(colors.border);
  const bgColor = String(colors.surface);

  const handleReset = useCallback(() => {
    if (disabled || !onReset) return;
    onReset();
  }, [onReset, disabled]);

  const sectionProps = {
    bgColor,
    borderColor,
    disabled,
    textColor,
    textSecondary,
    value,
    onChange,
  };

  return (
    <View style={styles.container} testID={TestIds.TYPOGRAPHY_EDITOR}>
      <Text style={[styles.sectionTitle, { color: textColor }]}>
        {FM('typography.title')}
      </Text>

      {/* Typography Sections */}
      <TypographySection sectionKey={TypographySectionKey.Title} {...sectionProps} />
      <TypographySection sectionKey={TypographySectionKey.Body} {...sectionProps} />
      <TypographySection sectionKey={TypographySectionKey.Price} {...sectionProps} />

      {/* Preview Section */}
      <TypographyPreview
        bgColor={bgColor}
        borderColor={borderColor}
        textColor={textColor}
        textSecondary={textSecondary}
        value={value}
      />

      {/* Reset Button */}
      {onReset ? (
        <View style={styles.resetContainer}>
          <TouchableOpacity
            accessibilityHint={FM('typography.resetHint')}
            accessibilityLabel={FM('typography.resetLabel')}
            accessibilityRole="button"
            disabled={disabled}
            style={[
              styles.resetButton,
              { borderColor },
              disabled && styles.resetButtonDisabled,
            ]}
            testID={TestIds.TYPOGRAPHY_RESET_BUTTON}
            onPress={handleReset}
          >
            <Text style={[styles.resetButtonText, { color: textColor }]}>
              {FM('typography.reset')}
            </Text>
          </TouchableOpacity>
        </View>
      ) : null}
    </View>
  );
};

export default TypographyEditor;

export { FONT_FAMILY_OPTIONS, FONT_SIZE_LIMITS, FONT_WEIGHT_OPTIONS } from '../utils/typographyConstants';
export type { GlobalTypography } from '../../../../types/menuStyleTypes';
