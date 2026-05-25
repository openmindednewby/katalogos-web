


/**
 * HeaderLogoSizeSelector Component
 *
 * A selector for logo size options (small/medium/large).
 */
import React from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { ACTIVE_BUTTON_BACKGROUND, LOGO_SIZE_OPTIONS } from '../utils/headerEditorConstants';
import { headerEditorStyles as styles } from '../utils/headerEditorStyles';

import type { LogoSize } from '../../../../types/menuStyleTypes';

// =============================================================================
// Types
// =============================================================================

interface Props {
  label: string;
  activeValue: LogoSize;
  onChange: (value: LogoSize) => void;
  disabled: boolean;
  textColor: string;
  borderColor: string;
  bgColor: string;
  accentColor: string;
}

// =============================================================================
// Constants
// =============================================================================

const LOGO_SIZE_TEST_IDS: Record<LogoSize, string> = {
  small: TestIds.HEADER_EDITOR_LOGO_SIZE_SMALL,
  medium: TestIds.HEADER_EDITOR_LOGO_SIZE_MEDIUM,
  large: TestIds.HEADER_EDITOR_LOGO_SIZE_LARGE,
};

// =============================================================================
// Component
// =============================================================================

const HeaderLogoSizeSelector = ({
  label,
  activeValue,
  onChange,
  disabled,
  textColor,
  borderColor,
  bgColor,
  accentColor,
}: Props): React.ReactElement => {

  return (
    <View style={[styles.selectorRow, disabled && styles.disabled]}>
      <Text style={[styles.selectorLabel, { color: textColor }]}>{label}</Text>
      <View style={styles.selectorButtonsContainer}>
        {LOGO_SIZE_OPTIONS.map((option) => {
          const isActive = activeValue === option.value;
          const buttonStyle: ViewStyle = {
            backgroundColor: isActive ? ACTIVE_BUTTON_BACKGROUND : bgColor,
            borderColor: isActive ? accentColor : borderColor,
          };
          return (
            <TouchableOpacity
              key={option.value}
              accessibilityHint={FM('headerEditor.logoSizeHint', FM(option.labelKey))}
              accessibilityLabel={FM(option.labelKey)}
              accessibilityRole="button"
              accessibilityState={{ selected: isActive }}
              disabled={disabled}
              style={[styles.selectorButton, buttonStyle, isActive && styles.selectorButtonActive]}
              testID={LOGO_SIZE_TEST_IDS[option.value]}
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

export default HeaderLogoSizeSelector;
