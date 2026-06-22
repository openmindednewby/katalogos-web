/**
 * IngredientsInput - Text input for menu item ingredients with AI auto-fill button.
 * The auto-fill button is gated to Pro+ tier.
 */
import React, { useCallback, useEffect, useMemo, useRef } from 'react';

import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useGenerateNutrition } from '../../../hooks/useGenerateNutrition';
import { isPaidFeatureError } from '../../../lib/api/utils/isPaidFeatureError';
import { useSubscription } from '../../../lib/subscription/hooks/useSubscription';
import { DISABLED_OPACITY } from '../../../shared/constants';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import UpgradePrompt from '../../Shared/UpgradePrompt';

import type { GenerateNutritionResponse } from '../../../hooks/useGenerateNutrition';
import type { NutritionalInfo } from '../../../types/menuTypes';


interface IngredientsInputProps {
  ingredients: string;
  itemName: string;
  menuExternalId: string;
  onIngredientsChange: (value: string) => void;
  onNutritionGenerated: (info: NutritionalInfo, allergens: string[]) => void;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  errorColor: string;
}

const ERROR_DISPLAY_MS = 4000;
const INPUT_LINES = 2;

const styles = StyleSheet.create({
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8, marginTop: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  button: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 4 },
  buttonDisabled: { opacity: DISABLED_OPACITY },
  buttonEnabled: { opacity: 1 },
  buttonText: { fontSize: 12, fontWeight: '600' },
  errorText: { fontSize: 12 },
});

const IngredientsInput: React.FC<IngredientsInputProps> = ({
  ingredients, itemName, menuExternalId,
  onIngredientsChange, onNutritionGenerated,
  borderColor, textColor, backgroundColor, primaryColor, textOnPrimary, errorColor,
}) => {
  const { isFreeTier, tier } = useSubscription();

  const mutationOptions = useMemo(() => ({
    onSuccess: (data: GenerateNutritionResponse) => {
      const info: NutritionalInfo = {
        calories: data.calories,
        proteinGrams: data.proteinGrams,
        carbsGrams: data.carbsGrams,
        fatGrams: data.fatGrams,
        fiberGrams: data.fiberGrams,
        sodiumMg: data.sodiumMg,
        servingSize: data.servingSize,
      };
      onNutritionGenerated(info, data.detectedAllergens);
    },
  }), [onNutritionGenerated]);

  const { mutate, isPending, error, reset } = useGenerateNutrition<Error>(mutationOptions);

  const errorTimerRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isValueDefined(error))
      errorTimerRef.current = setTimeout(() => { reset(); }, ERROR_DISPLAY_MS);

    return () => {
      if (isValueDefined(errorTimerRef.current)) clearTimeout(errorTimerRef.current);
    };
  }, [error, reset]);

  const handleAutoFill = useCallback(() => {
    mutate({ menuExternalId, itemName, ingredients });
  }, [mutate, menuExternalId, itemName, ingredients]);

  const isButtonDisabled = isPending || ingredients.trim() === '' || itemName.trim() === '';

  return (
    <View>
      <Text style={[styles.label, { color: textColor }]}>
        {FM('onlineMenus.nutrition.ingredientsLabel')}
      </Text>
      <TextInput
        multiline
        accessibilityHint={FM('onlineMenus.nutrition.ingredientsHint')}
        accessibilityLabel={FM('onlineMenus.nutrition.ingredientsLabel')}
        numberOfLines={INPUT_LINES}
        placeholder={FM('onlineMenus.nutrition.ingredientsPlaceholder')}
        style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
        testID={TestIds.NUTRITION_INGREDIENTS_INPUT}
        value={ingredients}
        onChangeText={onIngredientsChange}
      />

      <View style={styles.row}>
        {isFreeTier ? (
          <View testID={TestIds.NUTRITION_UPGRADE_PROMPT}>
            <UpgradePrompt
              currentTier={tier}
              requiredTier="Pro"
            />
          </View>
        ) : (
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.nutrition.autoFillHint')}
            accessibilityLabel={FM('onlineMenus.nutrition.autoFillButton')}
            accessibilityRole="button"
            disabled={isButtonDisabled}
            style={[
              styles.button,
              { backgroundColor: isButtonDisabled ? textColor : primaryColor },
              isButtonDisabled ? styles.buttonDisabled : styles.buttonEnabled,
            ]}
            testID={TestIds.NUTRITION_AUTO_FILL_BUTTON}
            onPress={handleAutoFill}
          >
            <Text style={[styles.buttonText, { color: textOnPrimary }]}>
              {isPending
                ? FM('onlineMenus.nutrition.autoFilling')
                : FM('onlineMenus.nutrition.autoFillButton')}
            </Text>
          </TouchableOpacity>
        )}

        {isPending ? (
          <ActivityIndicator
            color={primaryColor}
            size="small"
            testID={TestIds.NUTRITION_AUTO_FILL_LOADING}
          />
        ) : null}

        {isValueDefined(error) ? (
          <Text
            style={[styles.errorText, { color: errorColor }]}
            testID={TestIds.NUTRITION_AUTO_FILL_ERROR}
          >
            {isPaidFeatureError(error) ? FM('onlineMenus.aiUpgradeRequired') : FM('onlineMenus.nutrition.autoFillFailed')}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default IngredientsInput;
