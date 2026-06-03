/**
 * ModifierGroupCard - Single modifier group editor card.
 */
import React from 'react';

import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';

import type { ModifierGroup } from '../../../types/menuTypes';

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
  modifierRow: { flexDirection: 'row', alignItems: 'center', gap: ROW_GAP, marginBottom: ROW_GAP },
  modifierNameInput: { flex: 2 },
  modifierPriceInput: { flex: 1 },
  smallButton: { paddingHorizontal: PADDING, paddingVertical: SMALL_PADDING, borderRadius: SMALL_BUTTON_BORDER_RADIUS },
  smallButtonText: { fontSize: SMALL_FONT_SIZE, fontWeight: '600' },
  addButton: { paddingVertical: INNER_GAP, borderRadius: BORDER_RADIUS, alignItems: 'center', marginTop: INNER_GAP },
  addButtonText: { fontSize: SMALL_FONT_SIZE, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: INNER_GAP, marginBottom: INNER_GAP },
});

interface ModifierGroupCardProps {
  group: ModifierGroup;
  groupIndex: number;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  onDeleteGroup: (gi: number) => void;
  onGroupNameChange: (gi: number, name: string) => void;
  onRequiredToggle: (gi: number) => void;
  onAddModifier: (gi: number) => void;
  onDeleteModifier: (gi: number, mi: number) => void;
  onModifierNameChange: (gi: number, mi: number, name: string) => void;
  onModifierPriceChange: (gi: number, mi: number, text: string) => void;
}

const ModifierGroupCard: React.FC<ModifierGroupCardProps> = ({
  group, groupIndex, borderColor, textColor, backgroundColor,
  primaryColor, textOnPrimary, onDeleteGroup, onGroupNameChange,
  onRequiredToggle, onAddModifier, onDeleteModifier, onModifierNameChange, onModifierPriceChange,
}) => {
  const modifiers = group.modifiers ?? [];
  const isRequired = group.isRequired ?? false;

  return (
    <View style={[styles.groupCard, { borderColor, backgroundColor }]}>
      <View style={styles.groupHeader}>
        <Text style={[styles.label, { color: textColor }]}>{FM('onlineMenus.modifiers.groupName')}</Text>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.modifiers.deleteGroupHint')}
          accessibilityLabel={FM('onlineMenus.modifiers.deleteGroup')}
          accessibilityRole="button"
          style={[styles.smallButton, { backgroundColor: borderColor }]}
          testID={`${TestIds.MODIFIER_GROUP_DELETE_BUTTON}-${groupIndex}`}
          onPress={() => onDeleteGroup(groupIndex)}
        >
          <Text style={[styles.smallButtonText, { color: textColor }]}>{FM('onlineMenus.modifiers.deleteGroup')}</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        accessibilityHint={FM('onlineMenus.modifiers.groupNameHint')}
        accessibilityLabel={FM('onlineMenus.modifiers.groupName')}
        placeholder={FM('onlineMenus.modifiers.groupNamePlaceholder')}
        style={[styles.input, { borderColor, color: textColor, backgroundColor }]}
        testID={`${TestIds.MODIFIER_GROUP_NAME_INPUT}-${groupIndex}`}
        value={group.name}
        onChangeText={(text) => onGroupNameChange(groupIndex, text)}
      />

      <View style={styles.toggleRow}>
        <TouchableOpacity
          accessibilityHint={FM('onlineMenus.modifiers.isRequiredHint')}
          accessibilityLabel={FM('onlineMenus.modifiers.isRequired')}
          accessibilityRole="button"
          style={[styles.smallButton, { backgroundColor: isRequired ? primaryColor : borderColor }]}
          testID={`${TestIds.MODIFIER_GROUP_REQUIRED_TOGGLE}-${groupIndex}`}
          onPress={() => onRequiredToggle(groupIndex)}
        >
          <Text style={[styles.smallButtonText, { color: isRequired ? textOnPrimary : textColor }]}>
            {FM('onlineMenus.modifiers.isRequired')}
          </Text>
        </TouchableOpacity>
      </View>

      {modifiers.map((modifier, mi) => (
        <View key={`${modifier.name}-${modifier.displayOrder}`} style={styles.modifierRow}>
          <TextInput
            accessibilityHint={FM('onlineMenus.modifiers.modifierNameHint')}
            accessibilityLabel={FM('onlineMenus.modifiers.modifierName')}
            placeholder={FM('onlineMenus.modifiers.modifierNamePlaceholder')}
            style={[styles.input, styles.modifierNameInput, { borderColor, color: textColor, backgroundColor }]}
            testID={`${TestIds.MODIFIER_NAME_INPUT}-${groupIndex}-${mi}`}
            value={modifier.name}
            onChangeText={(text) => onModifierNameChange(groupIndex, mi, text)}
          />
          <TextInput
            accessibilityHint={FM('onlineMenus.modifiers.priceAdjustmentHint')}
            accessibilityLabel={FM('onlineMenus.modifiers.priceAdjustment')}
            keyboardType="decimal-pad"
            style={[styles.input, styles.modifierPriceInput, { borderColor, color: textColor, backgroundColor }]}
            testID={`${TestIds.MODIFIER_PRICE_INPUT}-${groupIndex}-${mi}`}
            value={String(modifier.priceAdjustment)}
            onChangeText={(text) => onModifierPriceChange(groupIndex, mi, text)}
          />
          <TouchableOpacity
            accessibilityHint={FM('onlineMenus.modifiers.deleteModifierHint')}
            accessibilityLabel={FM('onlineMenus.modifiers.deleteModifier')}
            accessibilityRole="button"
            style={[styles.smallButton, { backgroundColor: borderColor }]}
            testID={`${TestIds.MODIFIER_DELETE_BUTTON}-${groupIndex}-${mi}`}
            onPress={() => onDeleteModifier(groupIndex, mi)}
          >
            <Text style={[styles.smallButtonText, { color: textColor }]}>{FM('onlineMenus.modifiers.deleteModifier')}</Text>
          </TouchableOpacity>
        </View>
      ))}

      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.modifiers.addModifierHint')}
        accessibilityLabel={FM('onlineMenus.modifiers.addModifier')}
        accessibilityRole="button"
        style={[styles.addButton, { backgroundColor: primaryColor }]}
        testID={`${TestIds.MODIFIER_ADD_BUTTON}-${groupIndex}`}
        onPress={() => onAddModifier(groupIndex)}
      >
        <Text style={[styles.addButtonText, { color: textOnPrimary }]}>{FM('onlineMenus.modifiers.addModifier')}</Text>
      </TouchableOpacity>
    </View>
  );
};

export default ModifierGroupCard;
