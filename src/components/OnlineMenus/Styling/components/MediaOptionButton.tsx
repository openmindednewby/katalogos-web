import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { isValueDefined } from '@dloizides/utils';

import { FM } from '@/localization/helpers';

import { SvgIcon } from '../../../Icons';
import { SELECTED_BUTTON_TEXT_COLOR } from '../utils/mediaPositionConstants';
import { mediaPositionEditorStyles as parentStyles } from '../utils/mediaPositionEditorStyles';

import type { IconName } from '../../../Icons';

interface Props<T extends string> {
  option: { id: T; labelKey: string; icon?: IconName };
  currentValue: T | undefined;
  onPress: (id: T) => void;
  testIdPrefix: string;
  disabled?: boolean;
  textColor: string;
  surfaceColor: string;
  borderColor: string;
  primaryColor: string;
}

const OPTION_ICON_SIZE = 14;
const ICON_MARGIN_RIGHT = 4;

const styles = StyleSheet.create({
  contentRow: { flexDirection: 'row', alignItems: 'center' },
  iconSpacing: { marginRight: ICON_MARGIN_RIGHT },
});

const MediaOptionButton = <T extends string>({
  option,
  currentValue,
  onPress,
  testIdPrefix,
  disabled = false,
  textColor,
  surfaceColor,
  borderColor,
  primaryColor,
}: Props<T>): React.ReactElement => {

  const isSelected = option.id === currentValue;
  const selectedTextColor = isSelected ? SELECTED_BUTTON_TEXT_COLOR : textColor;

  const buttonStyle = [
    parentStyles.optionButton,
    {
      backgroundColor: isSelected ? primaryColor : surfaceColor,
      borderColor: isSelected ? primaryColor : borderColor,
    },
    disabled && parentStyles.disabled,
  ];

  const textStyle = [parentStyles.optionButtonText, { color: selectedTextColor }];

  const label = FM(option.labelKey);

  return (
    <TouchableOpacity
      accessibilityHint={FM('mediaPosition.selectHint', label)}
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected, disabled }}
      disabled={disabled}
      style={buttonStyle}
      testID={`${testIdPrefix}-${option.id}`}
      onPress={() => onPress(option.id)}
    >
      <View style={styles.contentRow}>
        {isValueDefined(option.icon) ? (
          <View style={styles.iconSpacing}>
            <SvgIcon color={selectedTextColor} name={option.icon} size={OPTION_ICON_SIZE} />
          </View>
        ) : null}
        <Text style={textStyle}>{label}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default MediaOptionButton;
