/**
 * DietaryTagFilter - Filter bar/chips on the public menu page.
 *
 * Allows customers to filter menu items by dietary tags.
 * Supports multi-select. Shows a "Clear Filters" chip when
 * any filters are active.
 */
import React, { useCallback, useMemo } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';
import type { ViewStyle, TextStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import { useTheme } from '../../../../theme/hooks/useTheme';
import { isNotEmptyArray } from '../../../../utils/is';
import { BADGE_OPACITY, SELECTED_CHIP_BORDER_WIDTH } from '../utils/dietaryTagConstants';
import { filterStyles } from '../utils/dietaryTagStyles';
import { hexToRgba } from '../utils/hexToRgba';

import type { DietaryTagDto } from '../../../../lib/hooks/dietaryTag/types';

// =============================================================================
// Sub-components (defined before main component to satisfy no-use-before-define)
// =============================================================================

interface ClearFilterChipProps {
  onClear: () => void;
  textColor: string;
  borderColor: string;
  testID: string;
}

const ClearFilterChip: React.FC<ClearFilterChipProps> = ({
  onClear,
  textColor,
  borderColor,
  testID,
}) => (
  <TouchableOpacity
    accessibilityHint={FM('dietaryTags.clearFiltersHint')}
    accessibilityLabel={FM('dietaryTags.clearFilters')}
    accessibilityRole="button"
    style={[filterStyles.clearButton, { borderColor }]}
    testID={`${testID}-clear`}
    onPress={onClear}
  >
    <Text style={[filterStyles.clearButtonText, { color: textColor }]}>
      {FM('dietaryTags.clearFilters')}
    </Text>
  </TouchableOpacity>
);

interface FilterChipProps {
  tag: DietaryTagDto;
  isSelected: boolean;
  onToggle: (tagKey: string) => void;
  textColor: string;
  borderColor: string;
  testID: string;
}

const FilterChip: React.FC<FilterChipProps> = ({
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

  const hintKey = isSelected
    ? 'dietaryTags.removeFilterHint'
    : 'dietaryTags.filterTagHint';

  return (
    <TouchableOpacity
      accessibilityHint={FM(hintKey, tag.name)}
      accessibilityLabel={tag.name}
      accessibilityRole="button"
      accessibilityState={{ selected: isSelected }}
      style={filterStyles.chipWrapper}
      testID={`${testID}-chip-${tag.key}`}
      onPress={() => onToggle(tag.key)}
    >
      <View style={[filterStyles.chip, chipStyle]}>
        <Text style={chipTextStyle}>{tag.icon}</Text>
        <Text style={[filterStyles.chipText, chipTextStyle]}>
          {tag.name}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// =============================================================================
// Main Component
// =============================================================================

interface DietaryTagFilterProps {
  availableTags: DietaryTagDto[];
  selectedTagKeys: string[];
  onToggleTag: (tagKey: string) => void;
  onClearFilters: () => void;
  testID?: string;
}

export const DietaryTagFilter: React.FC<DietaryTagFilterProps> = ({
  availableTags,
  selectedTagKeys,
  onToggleTag,
  onClearFilters,
  testID = TestIds.DIETARY_TAG_FILTER,
}) => {
  const { theme } = useTheme();
  const { colors } = theme;

  const selectedSet = useMemo(
    () => new Set(selectedTagKeys),
    [selectedTagKeys],
  );

  const hasFilters = isNotEmptyArray(selectedTagKeys);
  const hasTags = isNotEmptyArray(availableTags);

  const handleToggle = useCallback(
    (tagKey: string) => onToggleTag(tagKey),
    [onToggleTag],
  );

  if (!hasTags) return null;

  return (
    <View
      accessibilityHint={FM('dietaryTags.filterHint')}
      accessibilityLabel={FM('dietaryTags.filterLabel')}
      style={filterStyles.container}
      testID={testID}
    >
      <View style={filterStyles.scrollContent}>
        {hasFilters ? <ClearFilterChip
            borderColor={colors.border}
            testID={testID}
            textColor={colors.text}
            onClear={onClearFilters}
          /> : null}
        {availableTags.map((tag) => {
          const isSelected = selectedSet.has(tag.key);
          return (
            <FilterChip
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
      </View>
    </View>
  );
};
