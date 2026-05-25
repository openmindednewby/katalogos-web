/**
 * Form action buttons (Save/Cancel).
 * Uses core/Button instead of raw TouchableOpacity.
 */
import React from 'react';

import { StyleSheet, View, type ViewStyle } from 'react-native';

import { FM } from '../../localization/helpers';
import { Button, ButtonVariant } from '../core/Button';

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
  },
});

interface Props {
  onSave: () => void;
  onCancel?: () => void;
  saveLabel?: string;
  cancelLabel?: string;
  saving?: boolean;
  saveDisabled?: boolean;
  containerStyle?: ViewStyle;
}

export const FormActions = ({
  onSave,
  onCancel,
  saveLabel,
  cancelLabel,
  saving = false,
  saveDisabled = false,
  containerStyle,
}: Props): React.ReactElement => {
  const resolvedSaveLabel = saveLabel ?? FM('common.save');
  const resolvedCancelLabel = cancelLabel ?? FM('common.cancel');

  return (
    <View style={[styles.container, containerStyle]}>
      {typeof onCancel === 'function' ? (
        <Button
          accessibilityHint={FM('common.discardHint')}
          accessibilityLabel={resolvedCancelLabel}
          disabled={saving}
          label={resolvedCancelLabel}
          testID="cancel-button"
          variant={ButtonVariant.Outline}
          onPress={onCancel}
        />
      ) : null}

      <Button
        accessibilityHint={FM('common.saveHint')}
        accessibilityLabel={resolvedSaveLabel}
        disabled={saveDisabled}
        label={resolvedSaveLabel}
        loading={saving}
        testID="save-button"
        variant={ButtonVariant.Primary}
        onPress={onSave}
      />
    </View>
  );
};
