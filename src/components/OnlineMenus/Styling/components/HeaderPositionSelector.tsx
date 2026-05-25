


/**
 * HeaderPositionSelector Component
 *
 * A reusable selector for horizontal position options (left/center/right).
 */
import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { ACTIVE_BUTTON_BACKGROUND, POSITION_OPTIONS } from '../utils/headerEditorConstants';
import { headerEditorStyles as styles } from '../utils/headerEditorStyles';

import type { HorizontalPosition } from '../../../../types/menuStyleTypes';

// =============================================================================
// Types
// =============================================================================

interface Props {
  label: string;
  activeValue: HorizontalPosition;
  onChange: (value: HorizontalPosition) => void;
  disabled: boolean;
  testIdPrefix: 'logo-position' | 'title-position';
  textColor: string;
  borderColor: string;
  bgColor: string;
  accentColor: string;
}

// =============================================================================
// Constants
// =============================================================================

const LOGO_POSITION_TEST_IDS: Record<HorizontalPosition, string> = {
  left: TestIds.HEADER_EDITOR_LOGO_POSITION_LEFT,
  center: TestIds.HEADER_EDITOR_LOGO_POSITION_CENTER,
  right: TestIds.HEADER_EDITOR_LOGO_POSITION_RIGHT,
};

const TITLE_POSITION_TEST_IDS: Record<HorizontalPosition, string> = {
  left: TestIds.HEADER_EDITOR_TITLE_POSITION_LEFT,
  center: TestIds.HEADER_EDITOR_TITLE_POSITION_CENTER,
  right: TestIds.HEADER_EDITOR_TITLE_POSITION_RIGHT,
};

// =============================================================================
// Component
// =============================================================================

const HeaderPositionSelector = ({
  label,
  activeValue,
  onChange,
  disabled,
  testIdPrefix,
  textColor,
  borderColor,
  bgColor,
  accentColor,
}: Props): React.ReactElement => {
  const isLogoPosition = testIdPrefix === 'logo-position';
  const testIdMap = isLogoPosition ? LOGO_POSITION_TEST_IDS : TITLE_POSITION_TEST_IDS;

  return (
    <View style={[styles.selectorRow, disabled && styles.disabled]}>
      <Text style={[styles.selectorLabel, { color: textColor }]}>{label}</Text>
      <View style={styles.selectorButtonsContainer}>
        {POSITION_OPTIONS.map((option) => {
          const isActive = activeValue === option.value;
          const buttonStyle: ViewStyle = {
            backgroundColor: isActive ? ACTIVE_BUTTON_BACKGROUND : bgColor,
            borderColor: isActive ? accentColor : borderColor,
          };
          return (
            <TouchableOpacity
              key={option.value}
              accessibilityHint={FM('headerEditor.positionHint', FM(option.labelKey))}
              accessibilityLabel={FM(option.labelKey)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              disabled={disabled}
              style={[styles.selectorButton, buttonStyle, isActive && styles.selectorButtonActive]}
              testID={testIdMap[option.value]}
              onPress={() => onChange(option.value)}
            >
              <Text style={[styles.selectorButtonText, { color: isActive ? accentColor : textColor }]}>
                {FM(option.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default HeaderPositionSelector;
