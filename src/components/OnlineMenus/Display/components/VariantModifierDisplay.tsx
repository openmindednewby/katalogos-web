/**
 * VariantModifierDisplay - Shows variant and modifier options on a menu item.
 *
 * Renders variant groups (e.g., "Size: Small $12 / Medium $16 / Large $20")
 * and modifier groups (e.g., "Extras: Add cheese +$1.00, Bacon +$2.00").
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import {
  hasVariants,
  hasModifiers,
  formatPriceAdjustment,
} from '../../utils/variantModifierHelpers';

import type { MenuItem } from '../../../../types/menuTypes';

// =============================================================================
// Constants
// =============================================================================

const GROUP_MARGIN_TOP = 6;
const GROUP_NAME_FONT_SIZE = 12;
const OPTION_FONT_SIZE = 11;
const OPTION_GAP = 4;
const CURRENCY_SYMBOL = '$';

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: { marginTop: GROUP_MARGIN_TOP },
  groupContainer: { marginBottom: OPTION_GAP },
  groupName: { fontSize: GROUP_NAME_FONT_SIZE, fontWeight: '600' },
  optionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: OPTION_GAP },
  optionText: { fontSize: OPTION_FONT_SIZE },
});

// =============================================================================
// Props
// =============================================================================

interface Props {
  item: MenuItem;
  textColor: string;
  testID: string;
}

// =============================================================================
// Component
// =============================================================================

const VariantModifierDisplay: React.FC<Props> = ({ item, textColor, testID }) => {
  const showVariants = hasVariants(item);
  const showModifiers = hasModifiers(item);

  if (!showVariants && !showModifiers) return null;

  return (
    <View style={styles.container} testID={`${testID}-variants-modifiers`}>
      {showVariants
        ? (item.variantGroups ?? []).map((group, gi) => {
            const variants = (group.variants ?? []).filter((v) => v.isAvailable !== false);
            if (variants.length === 0) return null;

            const optionLabels = variants
              .map((v) => `${v.name} ${CURRENCY_SYMBOL}${v.price.toFixed(2)}`)
              .join(' / ');

            return (
              <View key={group.name} style={styles.groupContainer}>
                <Text style={[styles.groupName, { color: textColor }]}>
                  {group.name}
                </Text>
                <View style={styles.optionsRow}>
                  <Text
                    accessibilityHint={FM('onlineMenus.variants.title')}
                    accessibilityLabel={optionLabels}
                    style={[styles.optionText, { color: textColor }]}
                    testID={`${testID}-variant-group-${gi}`}
                  >
                    {optionLabels}
                  </Text>
                </View>
              </View>
            );
          })
        : null}

      {showModifiers
        ? (item.modifierGroups ?? []).map((group, gi) => {
            const modifiers = (group.modifiers ?? []).filter((m) => m.isAvailable !== false);
            if (modifiers.length === 0) return null;

            const optionLabels = modifiers
              .map((m) => `${m.name} ${formatPriceAdjustment(m.priceAdjustment)}`)
              .join(', ');

            return (
              <View key={group.name} style={styles.groupContainer}>
                <Text style={[styles.groupName, { color: textColor }]}>
                  {group.name}
                </Text>
                <View style={styles.optionsRow}>
                  <Text
                    accessibilityHint={FM('onlineMenus.modifiers.title')}
                    accessibilityLabel={optionLabels}
                    style={[styles.optionText, { color: textColor }]}
                    testID={`${testID}-modifier-group-${gi}`}
                  >
                    {optionLabels}
                  </Text>
                </View>
              </View>
            );
          })
        : null}
    </View>
  );
};

export default VariantModifierDisplay;
