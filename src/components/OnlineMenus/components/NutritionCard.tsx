/**
 * NutritionCard - Editable nutritional information display for the menu item editor.
 * Shows serving size, calories, macros grid, and detected allergens.
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import MacroField from './MacroField';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { formatCalories, parseNutritionInput } from '../../../utils/nutritionUtils';
import { DietaryTagBadge } from '../DietaryTags';

import type { DietaryTagDto } from '../../../lib/hooks/dietaryTag/types';
import type { NutritionalInfo } from '../../../types/menuTypes';

interface NutritionCardProps {
  info: NutritionalInfo;
  detectedAllergens?: string[];
  dietaryTags?: DietaryTagDto[];
  onUpdate: (updates: Partial<NutritionalInfo>) => void;
  onClear: () => void;
  onRegenerate: () => void;
  canRegenerate: boolean;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
}

const CARD_BORDER_RADIUS = 8;
const CARD_PADDING = 12;
const CARD_MARGIN_TOP = 12;
const CALORIES_FONT_SIZE = 28;

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: CARD_BORDER_RADIUS, padding: CARD_PADDING, marginTop: CARD_MARGIN_TOP },
  title: { fontSize: 14, fontWeight: '700', marginBottom: 8 },
  servingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 8 },
  servingInput: { flex: 1, borderWidth: 1, borderRadius: 4, padding: 6, fontSize: 13 },
  caloriesRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4, marginBottom: 12 },
  caloriesValue: { fontSize: CALORIES_FONT_SIZE, fontWeight: '700', borderBottomWidth: 1, paddingBottom: 2 },
  caloriesUnit: { fontSize: 14 },
  macrosGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  allergensRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 12 },
  allergensLabel: { fontSize: 12, fontWeight: '600', marginTop: 12, marginBottom: 4 },
  servingTitle: { marginBottom: 0 },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  actionButton: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  actionButtonText: { fontSize: 12, fontWeight: '600' },
});

const NutritionCard: React.FC<NutritionCardProps> = ({
  info, detectedAllergens, dietaryTags,
  onUpdate, onClear, onRegenerate, canRegenerate,
  borderColor, textColor, backgroundColor, primaryColor, textOnPrimary,
}) => {
  const handleNumericChange = useCallback(
    (field: keyof NutritionalInfo, value: string) => {
      onUpdate({ [field]: parseNutritionInput(value) });
    },
    [onUpdate],
  );

  const matchedAllergens = React.useMemo(() => {
    const allergens = detectedAllergens ?? [];
    if (!isValueDefined(dietaryTags) || allergens.length === 0) return [];
    return dietaryTags.filter((tag) => allergens.includes(tag.key));
  }, [detectedAllergens, dietaryTags]);

  return (
    <View style={[styles.card, { borderColor, backgroundColor }]} testID={TestIds.NUTRITION_CARD}>
      <Text style={[styles.title, { color: textColor }]}>
        {FM('onlineMenus.nutrition.cardTitle')}
      </Text>

      <View style={styles.servingRow}>
        <Text style={[styles.title, styles.servingTitle, { color: textColor }]}>
          {FM('onlineMenus.nutrition.servingSize')}
        </Text>
        <TextInput
          accessibilityHint={FM('onlineMenus.nutrition.servingSizeHint')}
          accessibilityLabel={FM('onlineMenus.nutrition.servingSize')}
          placeholder={FM('onlineMenus.nutrition.servingSizePlaceholder')}
          style={[styles.servingInput, { borderColor, color: textColor, backgroundColor }]}
          testID={TestIds.NUTRITION_SERVING_SIZE_INPUT}
          value={info.servingSize}
          onChangeText={(text) => { onUpdate({ servingSize: text }); }}
        />
      </View>

      <View style={styles.caloriesRow}>
        <TextInput
          accessibilityHint={FM('onlineMenus.nutrition.caloriesHint')}
          accessibilityLabel={FM('onlineMenus.nutrition.calories')}
          keyboardType="numeric"
          style={[styles.caloriesValue, { color: textColor, borderBottomColor: borderColor }]}
          testID={TestIds.NUTRITION_CALORIES_INPUT}
          value={formatCalories(info.calories)}
          onChangeText={(v) => { handleNumericChange('calories', v.replace(/,/g, '')); }}
        />
        <Text style={[styles.caloriesUnit, { color: textColor }]}>
          {FM('onlineMenus.nutrition.caloriesUnit')}
        </Text>
      </View>

      <View style={styles.macrosGrid}>
        <MacroField backgroundColor={backgroundColor} borderColor={borderColor} label={FM('onlineMenus.nutrition.protein')} testID={TestIds.NUTRITION_PROTEIN_INPUT} textColor={textColor} unit={FM('onlineMenus.nutrition.gramsUnit')} value={info.proteinGrams} onChangeValue={(v) => { handleNumericChange('proteinGrams', v); }} />
        <MacroField backgroundColor={backgroundColor} borderColor={borderColor} label={FM('onlineMenus.nutrition.carbs')} testID={TestIds.NUTRITION_CARBS_INPUT} textColor={textColor} unit={FM('onlineMenus.nutrition.gramsUnit')} value={info.carbsGrams} onChangeValue={(v) => { handleNumericChange('carbsGrams', v); }} />
        <MacroField backgroundColor={backgroundColor} borderColor={borderColor} label={FM('onlineMenus.nutrition.fat')} testID={TestIds.NUTRITION_FAT_INPUT} textColor={textColor} unit={FM('onlineMenus.nutrition.gramsUnit')} value={info.fatGrams} onChangeValue={(v) => { handleNumericChange('fatGrams', v); }} />
        <MacroField backgroundColor={backgroundColor} borderColor={borderColor} label={FM('onlineMenus.nutrition.fiber')} testID={TestIds.NUTRITION_FIBER_INPUT} textColor={textColor} unit={FM('onlineMenus.nutrition.gramsUnit')} value={info.fiberGrams} onChangeValue={(v) => { handleNumericChange('fiberGrams', v); }} />
        <MacroField backgroundColor={backgroundColor} borderColor={borderColor} label={FM('onlineMenus.nutrition.sodium')} testID={TestIds.NUTRITION_SODIUM_INPUT} textColor={textColor} unit={FM('onlineMenus.nutrition.milligramsUnit')} value={info.sodiumMg} onChangeValue={(v) => { handleNumericChange('sodiumMg', v); }} />
      </View>

      {matchedAllergens.length > 0 ? (
        <>
          <Text style={[styles.allergensLabel, { color: textColor }]} testID={TestIds.NUTRITION_DETECTED_ALLERGENS}>
            {FM('onlineMenus.nutrition.detectedAllergens')}
          </Text>
          <View accessibilityRole="list" style={styles.allergensRow}>
            {matchedAllergens.map((tag) => (
              <DietaryTagBadge key={tag.key} tag={tag} testID={TestIds.DIETARY_TAG_BADGE} />
            ))}
          </View>
        </>
      ) : null}

      <View style={styles.buttonRow}>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.nutrition.clearHint')}
          accessibilityLabel={FM('onlineMenus.nutrition.clearButton')}
          accessibilityRole="button"
          style={[styles.actionButton, { backgroundColor: borderColor }]}
          testID={TestIds.NUTRITION_CLEAR_BUTTON}
          onPress={onClear}
        >
          <Text style={[styles.actionButtonText, { color: textColor }]}>
            {FM('onlineMenus.nutrition.clearButton')}
          </Text>
        </TouchableOpacity>

        {canRegenerate ? (
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.nutrition.regenerateHint')}
            accessibilityLabel={FM('onlineMenus.nutrition.regenerateButton')}
            accessibilityRole="button"
            style={[styles.actionButton, { backgroundColor: primaryColor }]}
            testID={TestIds.NUTRITION_REGENERATE_BUTTON}
            onPress={onRegenerate}
          >
            <Text style={[styles.actionButtonText, { color: textOnPrimary }]}>
              {FM('onlineMenus.nutrition.regenerateButton')}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export default NutritionCard;
