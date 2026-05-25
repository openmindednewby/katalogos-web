/**
 * ItemOverrideControls - Per-item override inputs for price, availability,
 * and description when a location is selected.
 */
import React, { useCallback } from 'react';

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { isValueDefined } from '@/utils/is';

import type { MenuItemOverrideDto } from '../types';

interface ItemOverrideControlsProps {
  categoryIndex: number;
  itemIndex: number;
  basePrice?: number | null;
  override?: MenuItemOverrideDto;
  onSetOverride: (categoryIndex: number, itemIndex: number, updates: Partial<MenuItemOverrideDto>) => void;
  onClearOverride: (categoryIndex: number, itemIndex: number) => void;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
}

const styles = StyleSheet.create({
  container: { marginTop: 12, padding: 12, borderWidth: 1, borderRadius: 8 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 4, marginTop: 8 },
  labelFirst: { marginTop: 0 },
  basePriceLabel: { fontSize: 12, fontStyle: 'italic', marginBottom: 4 },
  input: { borderWidth: 1, borderRadius: 6, padding: 10, fontSize: 14 },
  toggleButton: { padding: 10, borderRadius: 6, marginTop: 4 },
  toggleText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
  resetButton: { padding: 10, borderRadius: 6, marginTop: 12 },
  resetText: { fontSize: 13, fontWeight: '600', textAlign: 'center' },
});

const ItemOverrideControls: React.FC<ItemOverrideControlsProps> = ({
  categoryIndex, itemIndex, basePrice, override,
  onSetOverride, onClearOverride,
  borderColor, textColor, backgroundColor, primaryColor, textOnPrimary,
}) => {
  const handlePriceChange = useCallback((text: string) => {
    const parsed = parseFloat(text);
    const price = isNaN(parsed) ? null : parsed;
    onSetOverride(categoryIndex, itemIndex, { priceOverride: price });
  }, [categoryIndex, itemIndex, onSetOverride]);

  const handleAvailabilityToggle = useCallback(() => {
    const current = override?.isAvailableOverride;
    const next = current !== true;
    onSetOverride(categoryIndex, itemIndex, { isAvailableOverride: next });
  }, [categoryIndex, itemIndex, override?.isAvailableOverride, onSetOverride]);

  const handleDescriptionChange = useCallback((text: string) => {
    const desc = text !== '' ? text : null;
    onSetOverride(categoryIndex, itemIndex, { descriptionOverride: desc });
  }, [categoryIndex, itemIndex, onSetOverride]);

  const handleReset = useCallback(() => {
    onClearOverride(categoryIndex, itemIndex);
  }, [categoryIndex, itemIndex, onClearOverride]);

  const priceDisplay = isValueDefined(override?.priceOverride)
    ? String(override.priceOverride)
    : '';

  const isAvailableOverride = override?.isAvailableOverride;
  const availabilityLabel = isAvailableOverride === true
    ? FM('onlineMenus.locationOverrides.overrideActive')
    : FM('onlineMenus.locationOverrides.overrideInactive');

  const testPrefix = `${categoryIndex}-${itemIndex}`;

  return (
    <View
      style={[styles.container, { borderColor, backgroundColor }]}
      testID={`${TestIds.OVERRIDE_CONTROLS}-${testPrefix}`}
    >
      <Text style={[styles.label, styles.labelFirst, { color: textColor }]}>
        {FM('onlineMenus.locationOverrides.priceOverride')}
      </Text>
      {isValueDefined(basePrice) ? (
        <Text style={[styles.basePriceLabel, { color: textColor }]}>
          {FM('onlineMenus.locationOverrides.basePriceLabel', String(basePrice))}
        </Text>
      ) : null}
      <TextInput
        accessibilityHint={FM('onlineMenus.locationOverrides.priceOverrideHint')}
        accessibilityLabel={FM('onlineMenus.locationOverrides.priceOverrideLabel')}
        keyboardType="decimal-pad"
        style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
        testID={`${TestIds.OVERRIDE_PRICE_INPUT}-${testPrefix}`}
        value={priceDisplay}
        onChangeText={handlePriceChange}
      />

      <Text style={[styles.label, { color: textColor }]}>
        {FM('onlineMenus.locationOverrides.availabilityOverride')}
      </Text>
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.locationOverrides.availabilityOverrideHint')}
        accessibilityLabel={FM('onlineMenus.locationOverrides.availabilityOverrideLabel')}
        accessibilityRole="button"
        style={[
          styles.toggleButton,
          { backgroundColor: isAvailableOverride === true ? primaryColor : borderColor },
        ]}
        testID={`${TestIds.OVERRIDE_AVAILABILITY_TOGGLE}-${testPrefix}`}
        onPress={handleAvailabilityToggle}
      >
        <Text
          style={[
            styles.toggleText,
            { color: isAvailableOverride === true ? textOnPrimary : textColor },
          ]}
        >
          {availabilityLabel}
        </Text>
      </TouchableOpacity>

      <Text style={[styles.label, { color: textColor }]}>
        {FM('onlineMenus.locationOverrides.descriptionOverride')}
      </Text>
      <TextInput
        multiline
        accessibilityHint={FM('onlineMenus.locationOverrides.descriptionOverrideHint')}
        accessibilityLabel={FM('onlineMenus.locationOverrides.descriptionOverrideLabel')}
        numberOfLines={2}
        placeholder={FM('onlineMenus.locationOverrides.descriptionOverridePlaceholder')}
        style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
        testID={`${TestIds.OVERRIDE_DESCRIPTION_INPUT}-${testPrefix}`}
        value={String(override?.descriptionOverride ?? '')}
        onChangeText={handleDescriptionChange}
      />

      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.locationOverrides.resetToBaseHint')}
        accessibilityLabel={FM('onlineMenus.locationOverrides.resetToBaseLabel')}
        accessibilityRole="button"
        style={[styles.resetButton, { backgroundColor: borderColor }]}
        testID={`${TestIds.OVERRIDE_RESET_BUTTON}-${testPrefix}`}
        onPress={handleReset}
      >
        <Text style={[styles.resetText, { color: textColor }]}>
          {FM('onlineMenus.locationOverrides.resetToBase')}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default ItemOverrideControls;
