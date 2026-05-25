/**
 * Sub-component for the deletion request form (reason input + request button).
 * Extracted from AccountDeletionSection to stay within the 200-line component limit.
 */
import React, { useCallback, useState } from 'react';

import { StyleSheet, Text, TextInput, View } from 'react-native';

import { FM } from '../../../../localization/helpers';
import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { Button, ButtonVariant } from '../../../core/Button';
import {
  DESCRIPTION_FONT_SIZE,
  MEDIUM_SPACING,
  INPUT_BORDER_WIDTH,
  INPUT_BORDER_RADIUS,
  INPUT_PADDING,
  BODY_FONT_SIZE,
  INPUT_MIN_HEIGHT,
  SMALL_SPACING,
} from '../constants';

const styles = StyleSheet.create({
  description: {
    fontSize: DESCRIPTION_FONT_SIZE,
    marginBottom: MEDIUM_SPACING,
  },
  reasonInput: {
    borderWidth: INPUT_BORDER_WIDTH,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    fontSize: BODY_FONT_SIZE,
    minHeight: INPUT_MIN_HEIGHT,
    marginBottom: MEDIUM_SPACING,
  },
  buttonSpacing: {
    marginTop: SMALL_SPACING,
  },
});

interface DeletionRequestFormProps {
  isRequesting: boolean;
  onRequest: (reason: string | undefined) => void;
}

const DeletionRequestForm = ({ isRequesting, onRequest }: DeletionRequestFormProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const [reason, setReason] = useState('');

  const handlePress = useCallback(() => {
    const trimmedReason = reason.trim();
    onRequest(trimmedReason !== '' ? trimmedReason : undefined);
  }, [reason, onRequest]);

  return (
    <>
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        {FM('settings.privacy.deletion.reasonLabel')}
      </Text>
      <TextInput
        multiline
        accessibilityHint={FM('settings.privacy.deletion.reasonPlaceholder')}
        accessibilityLabel={FM('settings.privacy.deletion.reasonLabel')}
        placeholder={FM('settings.privacy.deletion.reasonPlaceholder')}
        placeholderTextColor={colors.textSecondary}
        style={[styles.reasonInput, { borderColor: colors.border, color: colors.text }]}
        testID={TestIds.ACCOUNT_DELETION_REASON_INPUT}
        value={reason}
        onChangeText={setReason}
      />
      <View style={styles.buttonSpacing}>
        <Button
          accessibilityHint={FM('settings.privacy.deletion.requestButton')}
          accessibilityLabel={FM('settings.privacy.deletion.requestButton')}
          disabled={isRequesting}
          label={FM('settings.privacy.deletion.requestButton')}
          loading={isRequesting}
          testID={TestIds.ACCOUNT_DELETION_REQUEST_BUTTON}
          variant={ButtonVariant.Danger}
          onPress={handlePress}
        />
      </View>
    </>
  );
};

export default DeletionRequestForm;
