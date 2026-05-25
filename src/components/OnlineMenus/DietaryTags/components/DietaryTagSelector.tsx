/**
 * DietaryTagSelector - Multi-select tag picker for the menu item editor.
 *
 * Shows available dietary tags as colored chips.
 * Tapping a chip toggles its selection.
 * Selected tags are highlighted with the tag's color.
 */
import React, { useCallback, useMemo } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isNotEmptyArray } from '../../../../utils/is';
import { BADGE_OPACITY, SELECTED_CHIP_BORDER_WIDTH } from '../utils/dietaryTagConstants';
import { selectorStyles } from '../utils/dietaryTagStyles';
import { hexToRgba } from '../utils/hexToRgba';

import type { DietaryTagDto } from '../../../../lib/hooks/dietaryTag/types';

// =============================================================================
// Sub-component (defined before main component to satisfy no-use-before-define)
// =============================================================================

interface SelectorChipProps {
  tag: DietaryTagDto;
  isSelected: boolean;
  onToggle: (tagKey: string) => void;
  textColor: string;
  borderColor: string;
  testID: string;
}

const SelectorChip: React.FC<SelectorChipProps> = ({
  tag,
  isSelected,
  onToggle,
  textColor,
  borderColor,
  testID,
}) => {
  const chipStyle = useMemo<ViewStyle>(() => {
    if (isSelected)
      return {
        backgroundColor: hexToRgba(tag.color, BADGE_OPACITY),
        borderColor: tag.color,
        borderWidth: SELECTED_CHIP_BORDER_WIDTH,
      };

    return { borderColor };
  }, [isSelected, tag.color, borderColor]);

  const chipTextStyle = useMemo<TextStyle>(
    () => ({ color: isSelected ? tag.color : textColor }),
    [isSelected, tag.color, textColor],
  );

  return (
    <TouchableOpacity
      accessibilityHint={FM('dietaryTags.tagToggleHint', tag.name)}
      accessibilityLabel={tag.name}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={selectorStyles.chipWrapper}
      testID={`${testID}-chip-${tag.key}`}
      onPress={() => onToggle(tag.key)}
    >
      <View style={[selectorStyles.chip, chipStyle]}>
        <Text style={chipTextStyle}>{tag.icon}</Text>
        <Text style={[selectorStyles.chipText, chipTextStyle]}>
          {tag.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// =============================================================================
// Main Component
// =============================================================================

interface DietaryTagSelectorProps {
  availableTags: DietaryTagDto[];
  selectedTagKeys: string[];
  onToggleTag: (tagKey: string) => void;
  isLoading?: boolean;
  testID?: string;
}

export const DietaryTagSelector: React.FC<DietaryTagSelectorProps> = ({
  availableTags,
  selectedTagKeys,
  onToggleTag,
  isLoading = false,
  testID = TestIds.DIETARY_TAG_SELECTOR,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const selectedSet = useMemo(
    () => new Set(selectedTagKeys),
    [selectedTagKeys],
  );

  const handleToggle = useCallback(
    (tagKey: string) => onToggleTag(tagKey),
    [onToggleTag],
  );

  if (isLoading) return null;

  const hasTags = isNotEmptyArray(availableTags);

  return (
    <View style={selectorStyles.container} testID={testID}>
      <Text style={[selectorStyles.label, { color: colors.text }]}>
        {FM('dietaryTags.sectionLabel')}
      </Text>
      {!hasTags && (
        <Text style={[selectorStyles.emptyText, { color: colors.text }]}>
          {FM('dietaryTags.noTagsAvailable')}
        </Text>
      )}
      {hasTags ? <View style={selectorStyles.chipContainer}>
          {availableTags.map((tag) => {
            const isSelected = selectedSet.has(tag.key);
            return (
              <SelectorChip
                key={tag.key}
                borderColor={colors.border}
                isSelected={isSelected}
                tag={tag}
                testID={testID}
                textColor={colors.text}
                onToggle={handleToggle}
              />
            );
          })}
        </View> : null}
    </View>
  );
};

export default DietaryTagSelector;
