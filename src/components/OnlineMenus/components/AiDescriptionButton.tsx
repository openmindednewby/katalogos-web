/**
 * AiDescriptionButton - Button to generate AI-powered menu item descriptions.
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useGenerateMenuItemDescription } from '../../../hooks/useGenerateMenuItemDescription';
import { DISABLED_OPACITY } from '../../../shared/constants';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';


const ERROR_DISPLAY_MS = 4000;

interface AiDescriptionButtonProps {
  onGenerated: (text: string) => void;
  itemName: string;
  categoryName: string;
  price: number | undefined;
  existingDescription: string | undefined;
  menuExternalId: string;
  disabled: boolean;
  textColor: string;
  primaryColor: string;
  textOnPrimary: string;
  errorColor: string;
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  button: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  buttonDisabled: { opacity: DISABLED_OPACITY },
  buttonEnabled: { opacity: 1 },
  buttonText: { fontSize: 12, fontWeight: '600' },
  errorText: { fontSize: 12 },
});

const AiDescriptionButton: React.FC<AiDescriptionButtonProps> = ({
  onGenerated,
  itemName,
  categoryName,
  price,
  existingDescription,
  menuExternalId,
  disabled,
  textColor,
  primaryColor,
  textOnPrimary,
  errorColor,
}) => {
  const mutationOptions = useMemo(() => ({
    onSuccess: (data: { description: string }) => {
      onGenerated(data.description);
    },
  }), [onGenerated]);

  const { mutate, isPending, error, reset } = useGenerateMenuItemDescription<Error>(mutationOptions);

  const errorTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isValueDefined(error))
      errorTimerRef.current = setTimeout(() => { reset(); }, ERROR_DISPLAY_MS);

    return () => {
      if (isValueDefined(errorTimerRef.current)) clearTimeout(errorTimerRef.current);
    };
  }, [error, reset]);

  const handlePress = useCallback(() => {
    mutate({
      menuExternalId,
      itemName,
      categoryName,
      price,
      existingDescription,
    });
  }, [mutate, menuExternalId, itemName, categoryName, price, existingDescription]);

  const isDisabled = disabled || isPending || itemName.trim() === '';

  return (
    <View style={styles.container}>
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.aiGenerateHint')}
        accessibilityLabel={FM('onlineMenus.aiGenerate')}
        accessibilityRole="button"
        disabled={isDisabled}
        style={[styles.button, { backgroundColor: isDisabled ? textColor : primaryColor }, isDisabled ? styles.buttonDisabled : styles.buttonEnabled]}
        testID={TestIds.MENU_ITEM_AI_GENERATE_BUTTON}
        onPress={handlePress}
      >
        <Text style={[styles.buttonText, { color: textOnPrimary }]}>
          {isPending ? FM('onlineMenus.aiGenerating') : FM('onlineMenus.aiGenerate')}
        </Text>
      </TouchableOpacity>

      {isPending ? (
        <ActivityIndicator
          color={primaryColor}
          size="small"
          testID={TestIds.MENU_ITEM_AI_LOADING}
        />
      ) : null}

      {isValueDefined(error) ? (
        <Text
          style={[styles.errorText, { color: errorColor }]}
          testID={TestIds.MENU_ITEM_AI_ERROR}
        >
          {FM('onlineMenus.aiGenerateFailed')}
        </Text>
      ) : null}
    </View>
  );
};

export default AiDescriptionButton;
