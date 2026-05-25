

/**
 * BoxStyleEditor Component
 *
 * A reusable component for editing BoxStyling properties.
 * Used for styling category boxes, item boxes, and other containers.
 */
import React, { useCallback } from 'react';

import { Switch, Text, View } from 'react-native';
import type { TextStyle } from 'react-native';

import { useSelector } from 'react-redux';

import { FM } from '@/localization/helpers';

import BorderColorInput from './BorderColorInput';
import BoxStylePreview from './BoxStylePreview';
import SliderRow from './SliderRow';
import ThemeMode from '../../../../shared/enums/ThemeMode';
import { TestIds } from '../../../../shared/testIds';
import { themePalette } from '../../../../theme/utils/styles';
import {
  MAX_BORDER_RADIUS,
  MAX_BORDER_WIDTH,
  MAX_PADDING,
  MIN_BORDER_RADIUS,
  MIN_BORDER_WIDTH,
  MIN_PADDING,
} from '../utils/boxStyleEditorConstants';
import { boxStyleEditorStyles as styles } from '../utils/boxStyleEditorStyles';

import type { RootState } from '../../../../store/reduxStore';
import type { BoxStyling } from '../../../../types/menuStyleTypes';

interface Props {
  value: BoxStyling;
  onChange: (value: BoxStyling) => void;
  label?: string;
  disabled?: boolean;
}

const BoxStyleEditor: React.FC<Props> = ({ value, onChange, label, disabled = false }) => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;

  const textColor = String(colors.text);
  const textSecondary = String(colors.subtext);
  const borderColor = String(colors.border);
  const bgColor = String(colors.surface);
  const errorColor = String(colors.error);

  // Get current values with defaults
  const currentBorderColor = value.borderColor ?? '';
  const borderWidth = value.borderWidth ?? 0;
  const borderRadius = value.borderRadius ?? 0;
  const padding = value.padding ?? 0;
  const shadowEnabled = value.shadowEnabled ?? false;

  // Handlers
  const handleBorderColorChange = useCallback(
    (newColor: string) => {
      onChange({ ...value, borderColor: newColor });
    },
    [onChange, value],
  );

  const handleBorderWidthChange = useCallback(
    (newWidth: number) => {
      onChange({ ...value, borderWidth: newWidth });
    },
    [onChange, value],
  );

  const handleBorderRadiusChange = useCallback(
    (newRadius: number) => {
      onChange({ ...value, borderRadius: newRadius });
    },
    [onChange, value],
  );

  const handlePaddingChange = useCallback(
    (newPadding: number) => {
      onChange({ ...value, padding: newPadding });
    },
    [onChange, value],
  );

  const handleShadowToggle = useCallback(
    (enabled: boolean) => {
      onChange({ ...value, shadowEnabled: enabled });
    },
    [onChange, value],
  );

  const labelStyle: TextStyle = { color: textColor };
  const hasLabel = typeof label === 'string' && label !== '';

  return (
    <View style={styles.container} testID={TestIds.BOX_STYLE_EDITOR}>
      {hasLabel ? (
        <Text style={[styles.sectionTitle, labelStyle]}>{label}</Text>
      ) : (
        <Text style={[styles.sectionTitle, labelStyle]}>
          {FM('boxStyle.title')}
        </Text>
      )}

      {/* Preview */}
      <BoxStylePreview textColor={textColor} textSecondary={textSecondary} value={value} />

      {/* Controls */}
      <View style={styles.controlsContainer}>
        {/* Border Color */}
        <BorderColorInput
          bgColor={bgColor}
          borderColor={borderColor}
          disabled={disabled}
          errorColor={errorColor}
          textColor={textColor}
          textSecondary={textSecondary}
          value={currentBorderColor}
          onChange={handleBorderColorChange}
        />

        {/* Border Width */}
        <SliderRow
          accessibilityHint={FM('boxStyle.borderWidthHint')}
          accessibilityLabel={FM('boxStyle.borderWidth')}
          bgColor={bgColor}
          borderColor={borderColor}
          disabled={disabled}
          label={FM('boxStyle.borderWidth')}
          max={MAX_BORDER_WIDTH}
          min={MIN_BORDER_WIDTH}
          step={1}
          testIdPrefix={TestIds.BOX_STYLE_BORDER_WIDTH_SLIDER}
          textColor={textColor}
          value={borderWidth}
          onChange={handleBorderWidthChange}
        />

        {/* Border Radius */}
        <SliderRow
          accessibilityHint={FM('boxStyle.borderRadiusHint')}
          accessibilityLabel={FM('boxStyle.borderRadius')}
          bgColor={bgColor}
          borderColor={borderColor}
          disabled={disabled}
          label={FM('boxStyle.borderRadius')}
          max={MAX_BORDER_RADIUS}
          min={MIN_BORDER_RADIUS}
          step={2}
          testIdPrefix={TestIds.BOX_STYLE_BORDER_RADIUS_SLIDER}
          textColor={textColor}
          value={borderRadius}
          onChange={handleBorderRadiusChange}
        />

        {/* Padding */}
        <SliderRow
          accessibilityHint={FM('boxStyle.paddingHint')}
          accessibilityLabel={FM('boxStyle.padding')}
          bgColor={bgColor}
          borderColor={borderColor}
          disabled={disabled}
          label={FM('boxStyle.padding')}
          max={MAX_PADDING}
          min={MIN_PADDING}
          step={4}
          testIdPrefix={TestIds.BOX_STYLE_PADDING_SLIDER}
          textColor={textColor}
          value={padding}
          onChange={handlePaddingChange}
        />

        {/* Shadow Toggle */}
        <View style={styles.toggleRow}>
          <Text style={[styles.toggleLabel, labelStyle]}>
            {FM('boxStyle.shadow')}
          </Text>
          <Switch
            accessibilityHint={FM('boxStyle.shadowHint')}
            accessibilityLabel={FM('boxStyle.shadowLabel')}
            disabled={disabled}
            testID={TestIds.BOX_STYLE_SHADOW_TOGGLE}
            value={shadowEnabled}
            onValueChange={handleShadowToggle}
          />
        </View>
      </View>
    </View>
  );
};

export default BoxStyleEditor;

export { isValidHexColor } from '../utils/boxStyleEditorConstants';
