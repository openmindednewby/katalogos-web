/**
 * FeaturedItemControls - Collapsible section for Staff Pick / Featured item settings.
 *
 * Provides:
 * - Toggle to mark an item as a Staff Pick
 * - Text input for a staff note (max 120 chars, visible when featured)
 * - Numeric input for featured display order (visible when featured)
 */
import React, { useCallback, useState } from 'react';

import type { NativeSyntheticEvent, TextInputEndEditingEventData } from 'react-native';
import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../shared/testIds';
import { SvgIcon } from '../Icons';

import type { MenuItem } from '../../types/menuTypes';

// =============================================================================
// Constants
// =============================================================================

/** Standard React Native Switch inactive thumb color */
const SWITCH_THUMB_INACTIVE = '#f4f3f4';
/** Standard React Native Switch inactive track color */
const SWITCH_TRACK_INACTIVE = '#767577';
const CHEVRON_ICON_SIZE = 16;
const SECTION_PADDING = 12;
const BORDER_RADIUS = 6;
const BORDER_WIDTH = 1;
const TITLE_FONT_SIZE = 14;
const CONTENT_PADDING = 16;
const SECTION_GAP = 12;
const INPUT_BORDER_WIDTH = 1;
const INPUT_BORDER_RADIUS = 8;
const INPUT_PADDING = 12;
const INPUT_FONT_SIZE = 16;
const LABEL_FONT_SIZE = 14;
const LABEL_MARGIN_BOTTOM = 4;
const LABEL_MARGIN_TOP = 12;
const LABEL_MARGIN_TOP_ZERO = 0;
const STAFF_NOTE_MAX_LENGTH = 120;
const DEFAULT_FEATURED_ORDER = 0;

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    marginTop: SECTION_PADDING,
    borderRadius: BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SECTION_PADDING,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
  },
  content: {
    padding: CONTENT_PADDING,
    gap: SECTION_GAP,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '600',
    marginBottom: LABEL_MARGIN_BOTTOM,
    marginTop: LABEL_MARGIN_TOP,
  },
  labelNoMarginTop: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '600',
    marginBottom: LABEL_MARGIN_BOTTOM,
    marginTop: LABEL_MARGIN_TOP_ZERO,
  },
  input: {
    borderWidth: INPUT_BORDER_WIDTH,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    fontSize: INPUT_FONT_SIZE,
  },
});

// =============================================================================
// Props Interface
// =============================================================================

interface Props {
  item: MenuItem;
  onUpdate: (updates: Partial<MenuItem>) => void;
  borderColor: string;
  textColor: string;
  surfaceColor: string;
}

// =============================================================================
// Component
// =============================================================================

const FeaturedItemControls: React.FC<Props> = ({
  item,
  onUpdate,
  borderColor,
  textColor,
  surfaceColor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleFeaturedToggle = useCallback(
    (value: boolean) => {
      onUpdate({ isFeatured: value });
    },
    [onUpdate],
  );

  const handleStaffNoteChange = useCallback(
    (text: string) => {
      const trimmed = text.slice(0, STAFF_NOTE_MAX_LENGTH);
      onUpdate({ staffNote: trimmed !== '' ? trimmed : null });
    },
    [onUpdate],
  );

  const handleOrderEndEditing = useCallback(
    (e: NativeSyntheticEvent<TextInputEndEditingEventData>) => {
      const parsed = parseInt(e.nativeEvent.text, 10);
      const order = Number.isNaN(parsed) ? DEFAULT_FEATURED_ORDER : parsed;
      onUpdate({ featuredOrder: order });
    },
    [onUpdate],
  );

  const chevronName = isExpanded ? 'chevronUp' : 'chevronDown';
  const isFeatured = item.isFeatured === true;

  return (
    <View
      style={[styles.container, { borderColor }]}
      testID={TestIds.FEATURED_ITEM_CONTROLS}
    >
      <TouchableOpacity
        accessibilityHint={FM('featuredSection.toggleHint')}
        accessibilityLabel={FM('featuredSection.title')}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        style={[styles.header, { backgroundColor: surfaceColor }]}
        testID={`${TestIds.FEATURED_ITEM_CONTROLS}-header`}
        onPress={handleToggle}
      >
        <Text style={[styles.title, { color: textColor }]}>
          {FM('featuredSection.title')}
        </Text>
        <SvgIcon color={textColor} name={chevronName} size={CHEVRON_ICON_SIZE} />
      </TouchableOpacity>

      {isExpanded ? (
        <View style={styles.content} testID={`${TestIds.FEATURED_ITEM_CONTROLS}-content`}>
          <View style={styles.toggleRow}>
            <Text style={[styles.labelNoMarginTop, { color: textColor }]}>
              {FM('featuredSection.markAsFeatured')}
            </Text>
            <Switch
              accessibilityHint={FM('featuredSection.markAsFeaturedHint')}
              accessibilityLabel={FM('featuredSection.markAsFeatured')}
              testID={TestIds.FEATURED_ITEM_CONTROLS_TOGGLE}
              thumbColor={isFeatured ? surfaceColor : SWITCH_THUMB_INACTIVE}
              trackColor={{ false: SWITCH_TRACK_INACTIVE, true: borderColor }}
              value={isFeatured}
              onValueChange={handleFeaturedToggle}
            />
          </View>

          {isFeatured ? (
            <>
              <View>
                <Text style={[styles.label, { color: textColor }]}>
                  {FM('featuredSection.staffNote')}
                </Text>
                <TextInput
                  accessibilityHint={FM('featuredSection.staffNoteHint')}
                  accessibilityLabel={FM('featuredSection.staffNote')}
                  maxLength={STAFF_NOTE_MAX_LENGTH}
                  placeholder={FM('featuredSection.staffNotePlaceholder')}
                  style={[styles.input, { borderColor, color: textColor }]}
                  testID={TestIds.FEATURED_ITEM_CONTROLS_NOTE_INPUT}
                  value={String(item.staffNote ?? '')}
                  onChangeText={handleStaffNoteChange}
                />
              </View>

              <View>
                <Text style={[styles.label, { color: textColor }]}>
                  {FM('featuredSection.featuredOrder')}
                </Text>
                <TextInput
                  accessibilityHint={FM('featuredSection.featuredOrderHint')}
                  accessibilityLabel={FM('featuredSection.featuredOrder')}
                  defaultValue={String(item.featuredOrder ?? DEFAULT_FEATURED_ORDER)}
                  keyboardType="numeric"
                  style={[styles.input, { borderColor, color: textColor }]}
                  testID={TestIds.FEATURED_ITEM_CONTROLS_ORDER_INPUT}
                  onEndEditing={handleOrderEndEditing}
                />
              </View>
            </>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

export default FeaturedItemControls;
