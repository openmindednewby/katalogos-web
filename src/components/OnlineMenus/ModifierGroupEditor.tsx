/**
 * ModifierGroupEditor - CRUD editor for modifier groups on a menu item.
 */
import React, { useCallback, useMemo, useState } from 'react';

import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { FM } from '@/localization/helpers';

import ModifierGroupCard from './components/ModifierGroupCard';
import {
  addModifierGroup,
  addModifierToGroup,
  createModifier,
  createModifierGroup,
  removeModifierFromGroup,
  removeModifierGroup,
  updateModifierGroup,
  updateModifierInGroup,
} from './utils/variantModifierHelpers';
import { TestIds } from '../../shared/testIds';
import CollapsibleSection from '../Shared/CollapsibleSection';

import type { MenuItem } from '../../types/menuTypes';

// =============================================================================
// Constants
// =============================================================================

const INNER_GAP = 8;
const BORDER_RADIUS = 6;
const SMALL_FONT_SIZE = 12;

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  addButton: {
    paddingVertical: INNER_GAP,
    borderRadius: BORDER_RADIUS,
    alignItems: 'center',
    marginTop: INNER_GAP,
  },
  addButtonText: { fontSize: SMALL_FONT_SIZE, fontWeight: '600' },
});

// =============================================================================
// Props
// =============================================================================

interface Props {
  item: MenuItem;
  onUpdate: (updates: Partial<MenuItem>) => void;
  borderColor: string;
  textColor: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
}

// =============================================================================
// Component
// =============================================================================

const ModifierGroupEditor: React.FC<Props> = ({
  item,
  onUpdate,
  borderColor,
  textColor,
  backgroundColor,
  primaryColor,
  textOnPrimary,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const groups = useMemo(() => item.modifierGroups ?? [], [item.modifierGroups]);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleAddGroup = useCallback(() => {
    const newGroup = createModifierGroup(FM('onlineMenus.modifiers.groupNamePlaceholder'));
    onUpdate({ modifierGroups: addModifierGroup(groups, newGroup) });
  }, [groups, onUpdate]);

  const handleDeleteGroup = useCallback(
    (groupIndex: number) => {
      onUpdate({ modifierGroups: removeModifierGroup(groups, groupIndex) });
    },
    [groups, onUpdate],
  );

  const handleGroupNameChange = useCallback(
    (groupIndex: number, name: string) => {
      onUpdate({ modifierGroups: updateModifierGroup(groups, groupIndex, { name }) });
    },
    [groups, onUpdate],
  );

  const handleRequiredToggle = useCallback(
    (groupIndex: number) => {
      const current = groups[groupIndex]?.isRequired ?? false;
      onUpdate({
        modifierGroups: updateModifierGroup(groups, groupIndex, { isRequired: !current }),
      });
    },
    [groups, onUpdate],
  );

  const handleAddModifier = useCallback(
    (groupIndex: number) => {
      const modifier = createModifier('');
      onUpdate({ modifierGroups: addModifierToGroup(groups, groupIndex, modifier) });
    },
    [groups, onUpdate],
  );

  const handleDeleteModifier = useCallback(
    (groupIndex: number, modifierIndex: number) => {
      onUpdate({
        modifierGroups: removeModifierFromGroup(groups, groupIndex, modifierIndex),
      });
    },
    [groups, onUpdate],
  );

  const handleModifierNameChange = useCallback(
    (groupIndex: number, modifierIndex: number, name: string) => {
      onUpdate({
        modifierGroups: updateModifierInGroup(groups, groupIndex, modifierIndex, { name }),
      });
    },
    [groups, onUpdate],
  );

  const handleModifierPriceChange = useCallback(
    (groupIndex: number, modifierIndex: number, text: string) => {
      const parsed = parseFloat(text);
      if (!isNaN(parsed))
        onUpdate({
          modifierGroups: updateModifierInGroup(groups, groupIndex, modifierIndex, {
            priceAdjustment: parsed,
          }),
        });
    },
    [groups, onUpdate],
  );

  return (
    <CollapsibleSection
      borderColor={borderColor}
      isExpanded={isExpanded}
      surfaceColor={backgroundColor}
      testId={TestIds.MODIFIER_GROUP_SECTION}
      textColor={textColor}
      title={FM('onlineMenus.modifiers.title')}
      onToggle={handleToggle}
    >
      {groups.map((group, gi) => (
        <ModifierGroupCard
          key={`${group.name}-${group.displayOrder}`}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          group={group}
          groupIndex={gi}
          primaryColor={primaryColor}
          textColor={textColor}
          textOnPrimary={textOnPrimary}
          onAddModifier={handleAddModifier}
          onDeleteGroup={handleDeleteGroup}
          onDeleteModifier={handleDeleteModifier}
          onGroupNameChange={handleGroupNameChange}
          onModifierNameChange={handleModifierNameChange}
          onModifierPriceChange={handleModifierPriceChange}
          onRequiredToggle={handleRequiredToggle}
        />
      ))}

      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.modifiers.addGroupHint')}
        accessibilityLabel={FM('onlineMenus.modifiers.addGroup')}
        accessibilityRole="button"
        style={[styles.addButton, { backgroundColor: primaryColor }]}
        testID={TestIds.MODIFIER_GROUP_ADD_BUTTON}
        onPress={handleAddGroup}
      >
        <Text style={[styles.addButtonText, { color: textOnPrimary }]}>
          {FM('onlineMenus.modifiers.addGroup')}
        </Text>
      </TouchableOpacity>
    </CollapsibleSection>
  );
};

export default ModifierGroupEditor;
