/**
 * VariantGroupCard - Single variant group editor card.
 */
import React from 'react';

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';

import type { VariantGroup } from '../../../types/menuTypes';

const GROUP_GAP = 12;
const INNER_GAP = 8;
const BORDER_RADIUS = 6;
const BORDER_WIDTH = 1;
const PADDING = 10;
const SMALL_PADDING = 6;
const SMALL_FONT_SIZE = 12;
const LABEL_FONT_SIZE = 13;
const INPUT_FONT_SIZE = 14;
const INPUT_PADDING = 10;
const INPUT_BORDER_RADIUS = 6;
const ROW_GAP = 6;
const SMALL_BUTTON_BORDER_RADIUS = 4;

const styles = StyleSheet.create({
  groupCard: { borderWidth: BORDER_WIDTH, borderRadius: BORDER_RADIUS, padding: PADDING, marginBottom: GROUP_GAP },
  groupHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: INNER_GAP },
  label: { fontSize: LABEL_FONT_SIZE, fontWeight: '600', marginBottom: 4 },
  input: { borderWidth: BORDER_WIDTH, borderRadius: INPUT_BORDER_RADIUS, padding: INPUT_PADDING, fontSize: INPUT_FONT_SIZE },
  variantRow: { flexDirection: 'row', alignItems: 'center', gap: ROW_GAP, marginBottom: ROW_GAP },
  variantNameInput: { flex: 2 },
  variantPriceInput: { flex: 1 },
  smallButton: { paddingHorizontal: PADDING, paddingVertical: SMALL_PADDING, borderRadius: SMALL_BUTTON_BORDER_RADIUS },
  smallButtonText: { fontSize: SMALL_FONT_SIZE, fontWeight: '600' },
  addButton: { paddingVertical: INNER_GAP, borderRadius: BORDER_RADIUS, alignItems: 'center', marginTop: INNER_GAP },
  addButtonText: { fontSize: SMALL_FONT_SIZE, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: INNER_GAP, marginBottom: INNER_GAP },
});

interface VariantGroupCardProps {
  group: VariantGroup;
  groupIndex: number;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  onDeleteGroup: (gi: number) => void;
  onGroupNameChange: (gi: number, name: string) => void;
  onRequiredToggle: (gi: number) => void;
  onAddVariant: (gi: number) => void;
  onDeleteVariant: (gi: number, vi: number) => void;
  onVariantNameChange: (gi: number, vi: number, name: string) => void;
  onVariantPriceChange: (gi: number, vi: number, text: string) => void;
}

const VariantGroupCard: React.FC<VariantGroupCardProps> = ({
  group, groupIndex, borderColor, textColor, backgroundColor,
  primaryColor, textOnPrimary, onDeleteGroup, onGroupNameChange,
  onRequiredToggle, onAddVariant, onDeleteVariant, onVariantNameChange, onVariantPriceChange,
}) => {
  const variants = group.variants ?? [];
  const isRequired = group.isRequired ?? true;

  return (
    <View style={[styles.groupCard, { borderColor, backgroundColor }]}>
      <View style={styles.groupHeader}>
        <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.variants.groupName')}</Text>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.variants.deleteGroupHint')}
          accessibilityLabel={FM('onlineMenus.variants.deleteGroup')}
          accessibilityRole="button"
          style={[styles.smallButton, { backgroundColor: borderColor }]}
          testID={`${TestIds.VARIANT_GROUP_DELETE_BUTTON}-${groupIndex}`}
          onPress={() => onDeleteGroup(groupIndex)}
        >
          <Text style={[styles.smallButtonText, { color: textColor }]}>{FM('onlineMenus.variants.deleteGroup')}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        accessibilityHint={FM('onlineMenus.variants.groupNameHint')}
        accessibilityLabel={FM('onlineMenus.variants.groupName')}
        placeholder={FM('onlineMenus.variants.groupNamePlaceholder')}
        style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
        testID={`${TestIds.VARIANT_GROUP_NAME_INPUT}-${groupIndex}`}
        value={group.name}
        onChangeText={(text) => onGroupNameChange(groupIndex, text)}
      />

      <View style={styles.toggleRow}>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.variants.isRequiredHint')}
          accessibilityLabel={FM('onlineMenus.variants.isRequired')}
          accessibilityRole="button"
          style={[styles.smallButton, { backgroundColor: isRequired ? primaryColor : borderColor }]}
          testID={`${TestIds.VARIANT_GROUP_REQUIRED_TOGGLE}-${groupIndex}`}
          onPress={() => onRequiredToggle(groupIndex)}
        >
          <Text style={[styles.smallButtonText, { color: isRequired ? textOnPrimary : textColor }]}>
            {FM('onlineMenus.variants.isRequired')}
          </Text>
        </TouchableOpacity>
      </View>

      {variants.map((variant, vi) => (
        <View key={`${variant.name}-${variant.displayOrder}`} style={styles.variantRow}>
          <TextInput
            accessibilityHint={FM('onlineMenus.variants.variantNameHint')}
            accessibilityLabel={FM('onlineMenus.variants.variantName')}
            placeholder={FM('onlineMenus.variants.variantNamePlaceholder')}
            style={[styles.input, styles.variantNameInput, { borderColor, color: textColor, backgroundColor }]}
            testID={`${TestIds.VARIANT_NAME_INPUT}-${groupIndex}-${vi}`}
            value={variant.name}
            onChangeText={(text) => onVariantNameChange(groupIndex, vi, text)}
          />
          <TextInput
            accessibilityHint={FM('onlineMenus.variants.variantPriceHint')}
            accessibilityLabel={FM('onlineMenus.variants.variantPrice')}
            keyboardType="decimal-pad"
            style={[styles.input, styles.variantPriceInput, { borderColor, color: textColor, backgroundColor }]}
            testID={`${TestIds.VARIANT_PRICE_INPUT}-${groupIndex}-${vi}`}
            value={String(variant.price)}
            onChangeText={(text) => onVariantPriceChange(groupIndex, vi, text)}
          />
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.variants.deleteVariantHint')}
            accessibilityLabel={FM('onlineMenus.variants.deleteVariant')}
            accessibilityRole="button"
            style={[styles.smallButton, { backgroundColor: borderColor }]}
            testID={`${TestIds.VARIANT_DELETE_BUTTON}-${groupIndex}-${vi}`}
            onPress={() => onDeleteVariant(groupIndex, vi)}
          >
            <Text style={[styles.smallButtonText, { color: textColor }]}>{FM('onlineMenus.variants.deleteVariant')}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.variants.addVariantHint')}
        accessibilityLabel={FM('onlineMenus.variants.addVariant')}
        accessibilityRole="button"
        style={[styles.addButton, { backgroundColor: primaryColor }]}
        testID={`${TestIds.VARIANT_ADD_BUTTON}-${groupIndex}`}
        onPress={() => onAddVariant(groupIndex)}
      >
        <Text style={[styles.addButtonText, { color: textOnPrimary }]}>{FM('onlineMenus.variants.addVariant')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default VariantGroupCard;
