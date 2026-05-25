/**
 * AddDomainForm - text input and submit button for adding a custom domain.
 * Validates domain format before submission.
 */
import React, { useCallback, useState } from 'react';

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import {
  BODY_FONT_SIZE,
  DESCRIPTION_FONT_SIZE,
  INPUT_BORDER_RADIUS,
  INPUT_BORDER_WIDTH,
  INPUT_PADDING,
  MEDIUM_SPACING,
} from '../../constants';
import { ACTION_BORDER_RADIUS, ACTION_PADDING_H, ACTION_PADDING_V, DISABLED_OPACITY } from '../constants';
import { isValidDomain } from '../utils/domainValidation';

interface Props {
  isPending: boolean;
  onSubmit: (domainName: string) => void;
}

const styles = StyleSheet.create({
  container: { gap: MEDIUM_SPACING },
  input: {
    borderWidth: INPUT_BORDER_WIDTH,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    fontSize: BODY_FONT_SIZE,
  },
  errorText: { fontSize: DESCRIPTION_FONT_SIZE },
  submitButton: {
    paddingVertical: ACTION_PADDING_V,
    paddingHorizontal: ACTION_PADDING_H,
    borderRadius: ACTION_BORDER_RADIUS,
    alignSelf: 'flex-start',
  },
  submitText: { fontSize: BODY_FONT_SIZE, fontWeight: '600' },
  disabled: { opacity: DISABLED_OPACITY },
});

const AddDomainForm = ({ isPending, onSubmit }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];

  const [value, setValue] = useState('');
  const [showError, setShowError] = useState(false);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim().toLowerCase();
    if (!isValidDomain(trimmed)) {
      setShowError(true);
      return;
    }
    setShowError(false);
    onSubmit(trimmed);
  }, [value, onSubmit]);

  const handleChangeText = useCallback((text: string) => {
    setValue(text);
    if (showError) setShowError(false);
  }, [showError]);

  return (
    <View style={styles.container}>
      <TextInput
        accessibilityHint={FM('settings.customDomain.domainInputHint')}
        accessibilityLabel={FM('settings.customDomain.addDomain')}
        autoCapitalize="none"
        autoCorrect={false}
        editable={!isPending}
        keyboardType="url"
        placeholder={FM('settings.customDomain.domainPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[
          styles.input,
          {
            color: colors.text,
            borderColor: showError ? errorColor : colors.border,
            backgroundColor: colors.surface,
          },
        ]}
        testID={TestIds.CUSTOM_DOMAIN_ADD_INPUT}
        value={value}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
      />

      {showError ? (
        <Text
          style={[styles.errorText, { color: errorColor }]}
          testID={TestIds.CUSTOM_DOMAIN_VALIDATION_ERROR}
        >
          {FM('settings.customDomain.invalidDomain')}
        </Text>
      ) : null}

      <TouchableOpacity
        accessibilityHint={FM('settings.customDomain.addDomainHint')}
        accessibilityLabel={FM('settings.customDomain.addDomain')}
        accessibilityRole="button"
        disabled={isPending}
        style={[styles.submitButton, { backgroundColor: primary }, isPending ? styles.disabled : undefined]}
        testID={TestIds.CUSTOM_DOMAIN_ADD_BUTTON}
        onPress={handleSubmit}
      >
        <Text style={[styles.submitText, { color: colors.background }]}>
          {FM('settings.customDomain.addDomain')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AddDomainForm;
