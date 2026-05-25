/**
 * Reusable form field components for consistent styling across forms.
 */
import React from 'react';

import { StyleSheet, View, Text, TextInput, type TextInputProps, type TextStyle, type ViewStyle } from 'react-native';

import { useTheme } from '../../theme/hooks/useTheme';

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 4,
    fontWeight: '600',
  },
  input: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
});

interface ThemeStyles {
  label: TextStyle;
  requiredMark: TextStyle;
  input: TextStyle;
  errorText: TextStyle;
}

interface Props extends Omit<TextInputProps, 'style'> {
  label: string;
  required?: boolean;
  error?: string;
  containerStyle?: ViewStyle;
}

export const FormField = ({
  label,
  required = false,
  error,
  containerStyle,
  ...textInputProps
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors, semantic } = theme;
  const errorColor = semantic.error['500'];
  const hasError = typeof error === 'string' && error !== '';

  const themeStyles = React.useMemo<ThemeStyles>(() => {
    const labelStyle: TextStyle = { color: colors.text };
    const requiredMarkStyle: TextStyle = { color: errorColor };
    const inputStyle: TextStyle = {
      backgroundColor: colors.surface,
      color: colors.text,
      borderColor: hasError ? errorColor : colors.border,
    };
    const errorTextStyle: TextStyle = { color: errorColor };
    return {
      label: labelStyle,
      requiredMark: requiredMarkStyle,
      input: inputStyle,
      errorText: errorTextStyle,
    };
  }, [colors.border, colors.surface, colors.text, errorColor, hasError]);

  return (
    <View style={[styles.container, containerStyle]}>
      <Text style={[styles.label, themeStyles.label]}>
        {label} {required ? <Text style={themeStyles.requiredMark}>*</Text> : null}
      </Text>
      <TextInput
        accessibilityHint={`Enter ${label}`}
        accessibilityLabel={label}
        placeholderTextColor={colors.textSecondary}
        style={[styles.input, themeStyles.input]}
        testID="form-field-input"
        {...textInputProps}
      />
      {hasError ? <Text style={[styles.errorText, themeStyles.errorText]}>{error}</Text> : null}
    </View>
  );
};
