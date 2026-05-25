/**
 * NutritionLabel - Read-only nutritional info display for the public menu.
 * Shows calories prominently with an expandable section for full macros.
 * Only renders when nutritional info is present on the item.
 */
import React, { useState } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';
import { formatCalories, formatGrams, formatMilligrams } from '../../../utils/nutritionUtils';

import type { NutritionalInfo } from '../../../types/menuTypes';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';
import type { ResponsiveLayout } from '../utils/responsiveStyles';

interface NutritionLabelProps {
  info: NutritionalInfo;
  theme: PublicMenuTheme;
  responsive: ResponsiveLayout;
}

const LABEL_PADDING = 12;
const LABEL_BORDER_RADIUS = 8;
const LABEL_MARGIN_TOP = 12;
const LABEL_BORDER_WIDTH = 1;
const CALORIES_FONT_SIZE = 22;
const HEADING_FONT_SIZE = 13;
const MACRO_FONT_SIZE = 13;
const TOGGLE_FONT_SIZE = 12;
const MACRO_GAP = 8;
const DIVIDER_HEIGHT = 1;
const DIVIDER_OPACITY = 0.2;

const styles = StyleSheet.create({
  container: {
    borderWidth: LABEL_BORDER_WIDTH,
    borderRadius: LABEL_BORDER_RADIUS,
    padding: LABEL_PADDING,
    marginTop: LABEL_MARGIN_TOP,
  },
  heading: { fontSize: HEADING_FONT_SIZE, fontWeight: '700', marginBottom: 4 },
  caloriesRow: { flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' },
  caloriesText: { fontSize: CALORIES_FONT_SIZE, fontWeight: '700' },
  toggleButton: { paddingVertical: 4, paddingHorizontal: 8 },
  toggleText: { fontSize: TOGGLE_FONT_SIZE, fontWeight: '600' },
  divider: { height: DIVIDER_HEIGHT, marginVertical: MACRO_GAP },
  servingText: { fontSize: MACRO_FONT_SIZE, marginBottom: 4 },
  macrosContainer: { gap: MACRO_GAP, marginTop: MACRO_GAP },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between' },
  macroName: { fontSize: MACRO_FONT_SIZE },
  macroValue: { fontSize: MACRO_FONT_SIZE, fontWeight: '600' },
});

interface MacroRowColors {
  text: string;
  textSecondary: string;
}

interface MacroRowProps {
  name: string;
  value: string;
  colors: MacroRowColors;
}

const MacroRow: React.FC<MacroRowProps> = ({ name, value, colors }) => (
  <View style={styles.macroRow}>
    <Text style={[styles.macroName, { color: colors.textSecondary }]}>{name}</Text>
    <Text style={[styles.macroValue, { color: colors.text }]}>{value}</Text>
  </View>
);

export const NutritionLabel: React.FC<NutritionLabelProps> = ({
  info,
  theme,
  responsive: _responsive,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const colors = theme.colors;

  return (
    <View
      style={[styles.container, { borderColor: colors.border, backgroundColor: colors.surface }]}
      testID={TestIds.NUTRITION_LABEL}
    >
      <Text style={[styles.heading, { color: colors.text }]}>
        {FM('publicMenu.itemDetail.nutritionHeading')}
      </Text>

      <View style={styles.caloriesRow}>
        <Text style={[styles.caloriesText, { color: colors.text }]} testID={TestIds.NUTRITION_LABEL_CALORIES}>
          {FM('publicMenu.itemDetail.nutritionCalories', formatCalories(info.calories))}
        </Text>
        <TouchableOpacity
          accessibilityHint={FM('publicMenu.itemDetail.nutritionToggleHint')}
          accessibilityLabel={FM('publicMenu.itemDetail.nutritionToggle')}
          accessibilityRole="button"
          style={styles.toggleButton}
          testID={TestIds.NUTRITION_LABEL_TOGGLE}
          onPress={() => { setIsExpanded(!isExpanded); }}
        >
          <Text style={[styles.toggleText, { color: colors.accent }]}>
            {isExpanded ? FM('close') : FM('publicMenu.itemDetail.nutritionToggle')}
          </Text>
        </TouchableOpacity>
      </View>

      {isExpanded ? (
        <View testID={TestIds.NUTRITION_LABEL_MACROS}>
          <View style={[styles.divider, { backgroundColor: colors.text, opacity: DIVIDER_OPACITY }]} />

          {info.servingSize !== '' ? (
            <Text style={[styles.servingText, { color: colors.textSecondary }]}>
              {FM('publicMenu.itemDetail.nutritionServingSize', info.servingSize)}
            </Text>
          ) : null}

          <View style={styles.macrosContainer}>
            <MacroRow
              colors={colors}
              name={FM('onlineMenus.nutrition.protein')}
              value={FM('publicMenu.itemDetail.nutritionMacroGrams', formatGrams(info.proteinGrams))}
            />
            <MacroRow
              colors={colors}
              name={FM('onlineMenus.nutrition.carbs')}
              value={FM('publicMenu.itemDetail.nutritionMacroGrams', formatGrams(info.carbsGrams))}
            />
            <MacroRow
              colors={colors}
              name={FM('onlineMenus.nutrition.fat')}
              value={FM('publicMenu.itemDetail.nutritionMacroGrams', formatGrams(info.fatGrams))}
            />
            <MacroRow
              colors={colors}
              name={FM('onlineMenus.nutrition.fiber')}
              value={FM('publicMenu.itemDetail.nutritionMacroGrams', formatGrams(info.fiberGrams))}
            />
            <MacroRow
              colors={colors}
              name={FM('onlineMenus.nutrition.sodium')}
              value={FM('publicMenu.itemDetail.nutritionMacroMg', formatMilligrams(info.sodiumMg))}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};
