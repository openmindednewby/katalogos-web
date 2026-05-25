/**
 * LocationFormField - Reusable labeled text input for location forms.
 */
import React from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { useTheme } from '../../../../theme/hooks/useTheme';
import {
  BODY_FONT_SIZE,
  SMALL_SPACING,
  MEDIUM_SPACING,
  INPUT_BORDER_RADIUS,
  INPUT_PADDING,
  INPUT_BORDER_WIDTH,
} from '../../constants';

interface Props {
  label: string;
  value: string;
  placeholder: string;
  hint: string;
  testID: string;
  onChangeText: (text: string) => void;
}

const LABEL_FONT_WEIGHT = '500' as const;

const styles = StyleSheet.create({
  fieldGroup: { marginBottom: MEDIUM_SPACING },
  label: {
    fontSize: BODY_FONT_SIZE,
    fontWeight: LABEL_FONT_WEIGHT,
    marginBottom: SMALL_SPACING,
  },
  input: {
    borderWidth: INPUT_BORDER_WIDTH,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    fontSize: BODY_FONT_SIZE,
  },
});

const LocationFormField = ({
  label,
  value,
  placeholder,
  hint,
  testID,
  onChangeText,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  return (
    <View style={styles.fieldGroup}>
      <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      <TextInput
        accessibilityHint={hint}
        accessibilityLabel={label}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.surface }]}
        testID={testID}
        value={value}
        onChangeText={onChangeText}
      />
    </View>
  );
};

export default LocationFormField;
