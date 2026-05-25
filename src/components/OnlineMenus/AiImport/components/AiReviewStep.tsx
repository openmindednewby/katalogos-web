/**
 * Review step: displays AI-extracted categories and items for user editing.
 */
import React from 'react';

import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { countTotalItems } from '../utils/aiImportTransformers';

import type { ImportedItem, ImportedMenuData } from '../../../../types/aiImportTypes';

interface Props {
  data: ImportedMenuData;
  textColor: string;
  borderColor: string;
  primaryColor: string;
  onUpdateCategory: (catIndex: number, name: string) => void;
  onUpdateItem: (catIndex: number, itemIndex: number, updates: Partial<ImportedItem>) => void;
  onDeleteItem: (catIndex: number, itemIndex: number) => void;
  onAddItem: (catIndex: number) => void;
}

const SCROLL_MAX_HEIGHT = 400;
const CATEGORY_PADDING = 12;
const CATEGORY_MARGIN_BOTTOM = 16;
const ITEM_ROW_PADDING_V = 8;
const INPUT_PADDING = 6;
const INPUT_BORDER_RADIUS = 4;
const PRICE_INPUT_WIDTH = 80;
const DELETE_ICON = '\u{2717}';
const ADD_ICON = '+';

const localStyles = StyleSheet.create({
  scrollView: { maxHeight: SCROLL_MAX_HEIGHT },
  summaryText: { fontSize: 13, marginBottom: 12, opacity: 0.7 },
  categoryCard: { padding: CATEGORY_PADDING, borderRadius: 8, borderWidth: 1, marginBottom: CATEGORY_MARGIN_BOTTOM },
  categoryInput: { fontSize: 16, fontWeight: '600', marginBottom: 8, borderBottomWidth: 1 },
  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: ITEM_ROW_PADDING_V, gap: 8 },
  nameInput: { flex: 2, padding: INPUT_PADDING, borderWidth: 1, borderRadius: INPUT_BORDER_RADIUS, fontSize: 13 },
  descInput: { flex: 2, padding: INPUT_PADDING, borderWidth: 1, borderRadius: INPUT_BORDER_RADIUS, fontSize: 13 },
  priceInput: { width: PRICE_INPUT_WIDTH, padding: INPUT_PADDING, borderWidth: 1, borderRadius: INPUT_BORDER_RADIUS, fontSize: 13, textAlign: 'right' },
  deleteButton: { padding: 4 },
  deleteText: { fontSize: 16 },
  addButton: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 4 },
  addText: { fontSize: 13, fontWeight: '600' },
  emptyText: { fontSize: 14, textAlign: 'center', padding: 24 },
});

const AiReviewStep: React.FC<Props> = ({
  data, textColor, borderColor, primaryColor,
  onUpdateCategory, onUpdateItem, onDeleteItem, onAddItem,
}) => {
  const totalItems = countTotalItems(data);
  const categoryCount = data.categories.length;

  if (categoryCount === 0) 
    return (
      <Text style={[localStyles.emptyText, { color: textColor }]}>
        {FM('aiImport.review.noCategories')}
      </Text>
    );
  

  return (
    <ScrollView style={localStyles.scrollView} testID={TestIds.AI_IMPORT_REVIEW_LIST}>
      <Text style={[localStyles.summaryText, { color: textColor }]}>
        {FM('aiImport.review.itemCount', String(totalItems), String(categoryCount))}
      </Text>

      {data.categories.map((category, catIndex) => (
        // eslint-disable-next-line react/no-array-index-key -- AI-imported items lack stable IDs
        <View key={`cat-${category.name}-${catIndex}`} style={[localStyles.categoryCard, { borderColor }]}>
          <TextInput
            accessibilityHint={FM('aiImport.review.categoryLabel')}
            accessibilityLabel={FM('aiImport.review.categoryLabel')}
            style={[localStyles.categoryInput, { color: textColor, borderColor }]}
            testID={TestIds.AI_IMPORT_CATEGORY_NAME}
            value={category.name}
            onChangeText={(text) => { onUpdateCategory(catIndex, text); }}
          />

          {category.items.map((item, itemIndex) => (
            // eslint-disable-next-line react/no-array-index-key -- AI-imported items lack stable IDs
            <View key={`item-${item.name}-${catIndex}-${itemIndex}`} style={localStyles.itemRow}>
              <TextInput
                accessibilityHint={FM('aiImport.review.itemNameLabel')}
                accessibilityLabel={FM('aiImport.review.itemNameLabel')}
                placeholder={FM('aiImport.review.itemNamePlaceholder')}
                style={[localStyles.nameInput, { color: textColor, borderColor }]}
                testID={TestIds.AI_IMPORT_ITEM_NAME}
                value={item.name}
                onChangeText={(text) => { onUpdateItem(catIndex, itemIndex, { name: text }); }}
              />
              <TextInput
                accessibilityHint={FM('aiImport.review.descriptionLabel')}
                accessibilityLabel={FM('aiImport.review.descriptionLabel')}
                placeholder={FM('aiImport.review.descriptionPlaceholder')}
                style={[localStyles.descInput, { color: textColor, borderColor }]}
                testID={TestIds.AI_IMPORT_ITEM_DESCRIPTION}
                value={item.description ?? ''}
                onChangeText={(text) => { onUpdateItem(catIndex, itemIndex, { description: text }); }}
              />
              <TextInput
                accessibilityHint={FM('aiImport.review.priceLabel')}
                accessibilityLabel={FM('aiImport.review.priceLabel')}
                keyboardType="numeric"
                placeholder={FM('aiImport.review.pricePlaceholder')}
                style={[localStyles.priceInput, { color: textColor, borderColor }]}
                testID={TestIds.AI_IMPORT_ITEM_PRICE}
                value={String(item.price ?? 0)}
                onChangeText={(text) => {
                  const parsed = parseFloat(text);
                  if (!isNaN(parsed)) onUpdateItem(catIndex, itemIndex, { price: parsed });
                }}
              />
              <TouchableOpacity
                accessibilityHint={FM('aiImport.review.deleteItemHint')}
                accessibilityLabel={FM('aiImport.review.deleteItem')}
                accessibilityRole="button"
                style={localStyles.deleteButton}
                testID={TestIds.AI_IMPORT_DELETE_ITEM}
                onPress={() => { onDeleteItem(catIndex, itemIndex); }}
              >
                <Text style={[localStyles.deleteText, { color: textColor }]}>{DELETE_ICON}</Text>
              </TouchableOpacity>
            </View>
          ))}

          <TouchableOpacity
            accessibilityHint={FM('aiImport.review.addItemHint')}
            accessibilityLabel={FM('aiImport.review.addItem')}
            accessibilityRole="button"
            style={localStyles.addButton}
            testID={TestIds.AI_IMPORT_ADD_ITEM}
            onPress={() => { onAddItem(catIndex); }}
          >
            <Text style={[localStyles.addText, { color: primaryColor }]}>{ADD_ICON} {FM('aiImport.review.addItem')}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );
};

export default AiReviewStep;
