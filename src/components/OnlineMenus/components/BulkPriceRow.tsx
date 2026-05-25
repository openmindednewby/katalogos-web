/** BulkPriceRow - Inline price adjustment controls for bulk actions. */
import React, { useState } from 'react';

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { BulkPriceMode } from '../../../shared/enums/BulkPriceMode';
import { TestIds } from '../../../shared/testIds';

interface BulkPriceRowProps {
  onApply: (mode: BulkPriceMode, amount: number) => void;
  borderColor: string;
  textColor: string;
  primaryColor: string;
  textOnPrimary: string;
  backgroundColor: string;
}

const INPUT_PADDING_H = 8;
const INPUT_PADDING_V = 6;
const INPUT_MIN_WIDTH = 80;
const BUTTON_PADDING_H = 10;
const BUTTON_PADDING_V = 6;
const MODE_BUTTON_PADDING_H = 8;
const MODE_BUTTON_OPACITY = 0.4;

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  input: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: INPUT_PADDING_H,
    paddingVertical: INPUT_PADDING_V,
    minWidth: INPUT_MIN_WIDTH,
    fontSize: 14,
  },
  modeButton: { paddingHorizontal: MODE_BUTTON_PADDING_H, paddingVertical: BUTTON_PADDING_V, borderRadius: 4, borderWidth: 1 },
  modeButtonInactive: { opacity: MODE_BUTTON_OPACITY },
  modeText: { fontSize: 12, fontWeight: '600' },
  applyButton: { paddingHorizontal: BUTTON_PADDING_H, paddingVertical: BUTTON_PADDING_V, borderRadius: 4 },
  applyText: { fontSize: 12, fontWeight: '600' },
});

const BulkPriceRow: React.FC<BulkPriceRowProps> = ({
  onApply,
  borderColor,
  textColor,
  primaryColor,
  textOnPrimary,
  backgroundColor,
}) => {
  const [mode, setMode] = useState<BulkPriceMode>(BulkPriceMode.Fixed);
  const [amountText, setAmountText] = useState('');

  function handleApply(): void {
    const parsed = parseFloat(amountText);
    if (Number.isNaN(parsed)) return;
    onApply(mode, parsed);
  }

  return (
    <View style={styles.row}>
      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.bulkActions.adjustPriceHint')}
        accessibilityLabel={FM('onlineMenus.bulkActions.modeFixed')}
        accessibilityRole="button"
        style={[
          styles.modeButton,
          { borderColor, backgroundColor: mode === BulkPriceMode.Fixed ? primaryColor : backgroundColor },
          mode !== BulkPriceMode.Fixed ? styles.modeButtonInactive : undefined,
        ]}
        testID={`${TestIds.BULK_PRICE_BUTTON}-fixed`}
        onPress={() => { setMode(BulkPriceMode.Fixed); }}
      >
        <Text style={[styles.modeText, { color: mode === BulkPriceMode.Fixed ? textOnPrimary : textColor }]}>
          {FM('onlineMenus.bulkActions.modeFixed')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.bulkActions.adjustPriceHint')}
        accessibilityLabel={FM('onlineMenus.bulkActions.modePercentage')}
        accessibilityRole="button"
        style={[
          styles.modeButton,
          { borderColor, backgroundColor: mode === BulkPriceMode.Percentage ? primaryColor : backgroundColor },
          mode !== BulkPriceMode.Percentage ? styles.modeButtonInactive : undefined,
        ]}
        testID={`${TestIds.BULK_PRICE_BUTTON}-pct`}
        onPress={() => { setMode(BulkPriceMode.Percentage); }}
      >
        <Text style={[styles.modeText, { color: mode === BulkPriceMode.Percentage ? textOnPrimary : textColor }]}>
          {FM('onlineMenus.bulkActions.modePercentage')}
        </Text>
      </TouchableOpacity>

      <TextInput
        accessibilityHint={FM('onlineMenus.bulkActions.adjustPriceHint')}
        accessibilityLabel={FM('onlineMenus.bulkActions.priceAmount')}
        keyboardType="numeric"
        placeholder={FM('onlineMenus.bulkActions.priceAmount')}
        placeholderTextColor={borderColor}
        style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
        testID={TestIds.BULK_PRICE_AMOUNT_INPUT}
        value={amountText}
        onChangeText={setAmountText}
      />

      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.bulkActions.applyPriceHint')}
        accessibilityLabel={FM('onlineMenus.bulkActions.applyPrice')}
        accessibilityRole="button"
        style={[styles.applyButton, { backgroundColor: primaryColor }]}
        testID={TestIds.BULK_PRICE_APPLY_BUTTON}
        onPress={handleApply}
      >
        <Text style={[styles.applyText, { color: textOnPrimary }]}>{FM('onlineMenus.bulkActions.applyPrice')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default BulkPriceRow;
