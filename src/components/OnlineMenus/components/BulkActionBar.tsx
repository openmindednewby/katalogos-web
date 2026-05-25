/** BulkActionBar - Fixed bottom bar showing bulk actions during selection mode. */
import React, { useState } from 'react';

import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import BulkPriceRow from './BulkPriceRow';
import { TestIds } from '../../../shared/testIds';

import type { BulkPriceMode } from '../../../shared/enums/BulkPriceMode';
import type { Category } from '../../../types/menuTypes';

interface BulkActionBarProps {
  selectedCount: number;
  categories: Category[];
  onDelete: () => void;
  onMove: (targetCategoryIndex: number) => void;
  onSetAvailability: (isAvailable: boolean) => void;
  onPriceAdjust: (mode: BulkPriceMode, amount: number) => void;
  onCancel: () => void;
  borderColor: string;
  textColor: string;
  primaryColor: string;
  textOnPrimary: string;
  backgroundColor: string;
  errorColor: string;
}

const BAR_PADDING = 12;
const BAR_BORDER_TOP_WIDTH = 1;
const BUTTON_PADDING_H = 12;
const BUTTON_PADDING_V = 8;
const PICKER_MAX_HEIGHT = 120;
const ONE_ITEM = 1;

const styles = StyleSheet.create({
  bar: {
    padding: BAR_PADDING,
    borderTopWidth: BAR_BORDER_TOP_WIDTH,
  },
  topRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  countText: { fontSize: 14, fontWeight: '600' },
  actionsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  button: { paddingHorizontal: BUTTON_PADDING_H, paddingVertical: BUTTON_PADDING_V, borderRadius: 6 },
  buttonText: { fontSize: 13, fontWeight: '600' },
  picker: { maxHeight: PICKER_MAX_HEIGHT, marginTop: 8 },
  pickerItem: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 4, marginBottom: 4 },
  pickerText: { fontSize: 13 },
  priceSection: { marginTop: 8 },
});

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  categories,
  onDelete,
  onMove,
  onSetAvailability,
  onPriceAdjust,
  onCancel,
  borderColor,
  textColor,
  primaryColor,
  textOnPrimary,
  backgroundColor,
  errorColor,
}) => {
  const [showMovePicker, setShowMovePicker] = useState(false);
  const [showPriceRow, setShowPriceRow] = useState(false);

  const countLabel = selectedCount === ONE_ITEM
    ? FM('onlineMenus.bulkActions.selectedCount', String(selectedCount))
    : FM('onlineMenus.bulkActions.selectedCountPlural', String(selectedCount));

  return (
    <View style={[styles.bar, { borderColor, backgroundColor }]} testID={TestIds.BULK_ACTION_BAR}>
      <View style={styles.topRow}>
        <Text style={[styles.countText, { color: textColor }]} testID={TestIds.BULK_SELECTION_COUNT}>
          {countLabel}
        </Text>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.bulkActions.cancelHint')}
          accessibilityLabel={FM('onlineMenus.bulkActions.cancel')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: borderColor }]}
          testID={TestIds.BULK_CANCEL_BUTTON}
          onPress={onCancel}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>{FM('onlineMenus.bulkActions.cancel')}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.bulkActions.deleteSelectedHint')}
          accessibilityLabel={FM('onlineMenus.bulkActions.deleteSelected')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: errorColor }]}
          testID={TestIds.BULK_DELETE_BUTTON}
          onPress={onDelete}
        >
          <Text style={[styles.buttonText, { color: textOnPrimary }]}>{FM('onlineMenus.bulkActions.deleteSelected')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.bulkActions.moveToCategoryHint')}
          accessibilityLabel={FM('onlineMenus.bulkActions.moveToCategory')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: borderColor }]}
          testID={TestIds.BULK_MOVE_BUTTON}
          onPress={() => { setShowMovePicker((prev) => !prev); }}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>{FM('onlineMenus.bulkActions.moveToCategory')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.bulkActions.markAvailableHint')}
          accessibilityLabel={FM('onlineMenus.bulkActions.markAvailable')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: borderColor }]}
          testID={TestIds.BULK_AVAILABILITY_AVAILABLE_BUTTON}
          onPress={() => { onSetAvailability(true); }}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>{FM('onlineMenus.bulkActions.markAvailable')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.bulkActions.markUnavailableHint')}
          accessibilityLabel={FM('onlineMenus.bulkActions.markUnavailable')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: borderColor }]}
          testID={TestIds.BULK_AVAILABILITY_UNAVAILABLE_BUTTON}
          onPress={() => { onSetAvailability(false); }}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>{FM('onlineMenus.bulkActions.markUnavailable')}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.bulkActions.adjustPriceHint')}
          accessibilityLabel={FM('onlineMenus.bulkActions.adjustPrice')}
          accessibilityRole="button"
          style={[styles.button, { backgroundColor: borderColor }]}
          testID={TestIds.BULK_PRICE_BUTTON}
          onPress={() => { setShowPriceRow((prev) => !prev); }}
        >
          <Text style={[styles.buttonText, { color: textColor }]}>{FM('onlineMenus.bulkActions.adjustPrice')}</Text>
        </TouchableOpacity>
      </View>

      {showMovePicker ? (
        <ScrollView style={styles.picker} testID={TestIds.BULK_MOVE_CATEGORY_PICKER}>
          {categories.map((cat, index) => (
            <TouchableOpacity
              key={cat.id ?? `pick-${index}`}
              accessibilityHint={FM('onlineMenus.bulkActions.moveToCategoryHint')}
              accessibilityLabel={String(cat.name ?? FM('onlineMenus.bulkActions.selectTargetCategory'))}
              accessibilityRole="button"
              style={[styles.pickerItem, { backgroundColor: primaryColor }]}
              testID={`${TestIds.BULK_MOVE_CATEGORY_PICKER}-${index}`}
              onPress={() => {
                onMove(index);
                setShowMovePicker(false);
              }}
            >
              <Text style={[styles.pickerText, { color: textOnPrimary }]}>{String(cat.name ?? '')}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      {showPriceRow ? (
        <View style={styles.priceSection}>
          <BulkPriceRow
            backgroundColor={backgroundColor}
            borderColor={borderColor}
            primaryColor={primaryColor}
            textColor={textColor}
            textOnPrimary={textOnPrimary}
            onApply={onPriceAdjust}
          />
        </View>
      ) : null}
    </View>
  );
};

export default BulkActionBar;
