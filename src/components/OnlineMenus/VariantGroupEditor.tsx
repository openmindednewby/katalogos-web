/**
 * VariantGroupEditor - CRUD editor for variant groups on a menu item.
 *
 * Renders a collapsible section with controls to:
 * - Add/remove variant groups (e.g., "Size")
 * - Add/remove variants within each group (e.g., Small $12, Large $20)
 * - Set group name, required flag
 * - Set variant name and absolute price
 */
import React, { useCallback, useMemo, useState } from 'react';

import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { FM } from '@/localization/helpers';

import VariantGroupCard from './components/VariantGroupCard';
import {
  addVariantGroup,
  addVariantToGroup,
  createVariant,
  createVariantGroup,
  removeVariantFromGroup,
  removeVariantGroup,
  updateVariantGroup,
  updateVariantInGroup,
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

const VariantGroupEditor: React.FC<Props> = ({
  item,
  onUpdate,
  borderColor,
  textColor,
  backgroundColor,
  primaryColor,
  textOnPrimary,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const groups = useMemo(() => item.variantGroups ?? [], [item.variantGroups]);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleAddGroup = useCallback(() => {
    const newGroup = createVariantGroup(FM('onlineMenus.variants.groupNamePlaceholder'));
    onUpdate({ variantGroups: addVariantGroup(groups, newGroup) });
  }, [groups, onUpdate]);

  const handleDeleteGroup = useCallback(
    (groupIndex: number) => {
      onUpdate({ variantGroups: removeVariantGroup(groups, groupIndex) });
    },
    [groups, onUpdate],
  );

  const handleGroupNameChange = useCallback(
    (groupIndex: number, name: string) => {
      onUpdate({ variantGroups: updateVariantGroup(groups, groupIndex, { name }) });
    },
    [groups, onUpdate],
  );

  const handleRequiredToggle = useCallback(
    (groupIndex: number) => {
      const current = groups[groupIndex]?.isRequired ?? true;
      onUpdate({ variantGroups: updateVariantGroup(groups, groupIndex, { isRequired: !current }) });
    },
    [groups, onUpdate],
  );

  const handleAddVariant = useCallback(
    (groupIndex: number) => {
      const variant = createVariant('');
      onUpdate({ variantGroups: addVariantToGroup(groups, groupIndex, variant) });
    },
    [groups, onUpdate],
  );

  const handleDeleteVariant = useCallback(
    (groupIndex: number, variantIndex: number) => {
      onUpdate({ variantGroups: removeVariantFromGroup(groups, groupIndex, variantIndex) });
    },
    [groups, onUpdate],
  );

  const handleVariantNameChange = useCallback(
    (groupIndex: number, variantIndex: number, name: string) => {
      onUpdate({
        variantGroups: updateVariantInGroup(groups, groupIndex, variantIndex, { name }),
      });
    },
    [groups, onUpdate],
  );

  const handleVariantPriceChange = useCallback(
    (groupIndex: number, variantIndex: number, text: string) => {
      const parsed = parseFloat(text);
      if (!isNaN(parsed))
        onUpdate({
          variantGroups: updateVariantInGroup(groups, groupIndex, variantIndex, { price: parsed }),
        });
    },
    [groups, onUpdate],
  );

  return (
    <CollapsibleSection
      borderColor={borderColor}
      isExpanded={isExpanded}
      surfaceColor={backgroundColor}
      testId={TestIds.VARIANT_GROUP_SECTION}
      textColor={textColor}
      title={FM('onlineMenus.variants.title')}
      onToggle={handleToggle}
    >
      {groups.map((group, gi) => (
        <VariantGroupCard
          key={`${group.name}-${group.displayOrder}`}
          backgroundColor={backgroundColor}
          borderColor={borderColor}
          group={group}
          groupIndex={gi}
          primaryColor={primaryColor}
          textColor={textColor}
          textOnPrimary={textOnPrimary}
          onAddVariant={handleAddVariant}
          onDeleteGroup={handleDeleteGroup}
          onDeleteVariant={handleDeleteVariant}
          onGroupNameChange={handleGroupNameChange}
          onRequiredToggle={handleRequiredToggle}
          onVariantNameChange={handleVariantNameChange}
          onVariantPriceChange={handleVariantPriceChange}
        />
      ))}

      <TouchableOpacity
        accessibilityHint={FM('onlineMenus.variants.addGroupHint')}
        accessibilityLabel={FM('onlineMenus.variants.addGroup')}
        accessibilityRole="button"
        style={[styles.addButton, { backgroundColor: primaryColor }]}
        testID={TestIds.VARIANT_GROUP_ADD_BUTTON}
        onPress={handleAddGroup}
      >
        <Text style={[styles.addButtonText, { color: textOnPrimary }]}>
          {FM('onlineMenus.variants.addGroup')}
        </Text>
      </TouchableOpacity>
    </CollapsibleSection>
  );
};

export default VariantGroupEditor;
