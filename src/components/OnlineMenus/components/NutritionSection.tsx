/**
 * NutritionSection - Ingredients input + NutritionCard wrapper for menu item editor.
 * Manages nutrition-specific callbacks and state display.
 */
import React, { useCallback } from 'react';

import { View } from 'react-native';

import IngredientsInput from './IngredientsInput';
import NutritionCard from './NutritionCard';
import { isValueDefined } from '../../../utils/is';
import { hasNutritionData } from '../../../utils/nutritionUtils';

import type { DietaryTagDto } from '../../../lib/hooks/dietaryTag/types';
import type { MenuItem, NutritionalInfo } from '../../../types/menuTypes';

interface NutritionSectionProps {
  item: MenuItem;
  menuExternalId: string;
  onUpdate: (updates: Partial<MenuItem>) => void;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  errorColor: string;
  dietaryTags?: DietaryTagDto[];
}

const NutritionSection: React.FC<NutritionSectionProps> = ({
  item, menuExternalId, onUpdate,
  borderColor, textColor, backgroundColor, primaryColor, textOnPrimary, errorColor,
  dietaryTags,
}) => {
  const showCard = hasNutritionData(item.nutritionalInfo);
  const ingredientsValue = String(item.ingredients ?? '');

  const handleNutritionGenerated = useCallback(
    (info: NutritionalInfo, allergens: string[]) => {
      onUpdate({ nutritionalInfo: info, detectedAllergens: allergens });
    },
    [onUpdate],
  );

  const handleNutritionUpdate = useCallback(
    (updates: Partial<NutritionalInfo>) => {
      const current = item.nutritionalInfo;
      if (!isValueDefined(current)) return;
      onUpdate({ nutritionalInfo: { ...current, ...updates } });
    },
    [item.nutritionalInfo, onUpdate],
  );

  const handleClear = useCallback(() => {
    onUpdate({ nutritionalInfo: null, detectedAllergens: [] });
  }, [onUpdate]);

  const handleRegenerate = useCallback(() => {
    onUpdate({ nutritionalInfo: null, detectedAllergens: [] });
  }, [onUpdate]);

  const handleIngredientsChange = useCallback(
    (val: string) => { onUpdate({ ingredients: val !== '' ? val : null }); },
    [onUpdate],
  );

  return (
    <View>
      <IngredientsInput
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        errorColor={errorColor}
        ingredients={ingredientsValue}
        itemName={String(item.name ?? '')}
        menuExternalId={menuExternalId}
        primaryColor={primaryColor}
        textColor={textColor}
        textOnPrimary={textOnPrimary}
        onIngredientsChange={handleIngredientsChange}
        onNutritionGenerated={handleNutritionGenerated}
      />

      {showCard && isValueDefined(item.nutritionalInfo) ? (
        <NutritionCard
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          canRegenerate={ingredientsValue.trim() !== ''}
          detectedAllergens={item.detectedAllergens}
          dietaryTags={dietaryTags}
          info={item.nutritionalInfo}
          primaryColor={primaryColor}
          textColor={textColor}
          textOnPrimary={textOnPrimary}
          onClear={handleClear}
          onRegenerate={handleRegenerate}
          onUpdate={handleNutritionUpdate}
        />
      ) : null}
    </View>
  );
};

export default NutritionSection;
