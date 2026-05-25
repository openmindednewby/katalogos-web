/**
 * FeaturedSectionSettings - Settings for the featured/Staff Picks section.
 *
 * Provides:
 * - Toggle to enable/disable the Staff Picks section on the public menu
 * - Text input for a custom section title
 */
import React, { useCallback, useState } from 'react';

import { StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../shared/testIds';
import { SvgIcon } from '../Icons';

import type { MenuContents } from '../../types/menuTypes';

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
  menuContents: MenuContents;
  onUpdate: (contents: MenuContents) => void;
  borderColor: string;
  textColor: string;
  surfaceColor: string;
}

// =============================================================================
// Component
// =============================================================================

const FeaturedSectionSettings: React.FC<Props> = ({
  menuContents,
  onUpdate,
  borderColor,
  textColor,
  surfaceColor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleEnabledToggle = useCallback(
    (value: boolean) => {
      onUpdate({ ...menuContents, featuredSectionEnabled: value });
    },
    [menuContents, onUpdate],
  );

  const handleTitleChange = useCallback(
    (text: string) => {
      onUpdate({
        ...menuContents,
        featuredSectionTitle: text !== '' ? text : null,
      });
    },
    [menuContents, onUpdate],
  );

  const chevronName = isExpanded ? 'chevronUp' : 'chevronDown';
  const isEnabled = menuContents.featuredSectionEnabled !== false;

  return (
    <View
      style={[styles.container, { borderColor }]}
      testID={TestIds.FEATURED_SECTION_SETTINGS}
    >
      <TouchableOpacity
        accessibilityHint={FM('featuredSection.toggleHint')}
        accessibilityLabel={FM('featuredSection.sectionTitle')}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        style={[styles.header, { backgroundColor: surfaceColor }]}
        testID={`${TestIds.FEATURED_SECTION_SETTINGS}-header`}
        onPress={handleToggle}
      >
        <Text style={[styles.title, { color: textColor }]}>
          {FM('featuredSection.sectionTitle')}
        </Text>
        <SvgIcon color={textColor} name={chevronName} size={CHEVRON_ICON_SIZE} />
      </TouchableOpacity>

      {isExpanded ? (
        <View style={styles.content} testID={`${TestIds.FEATURED_SECTION_SETTINGS}-content`}>
          <View style={styles.toggleRow}>
            <Text style={[styles.labelNoMarginTop, { color: textColor }]}>
              {FM('featuredSection.showSection')}
            </Text>
            <Switch
              accessibilityHint={FM('featuredSection.showSectionHint')}
              accessibilityLabel={FM('featuredSection.showSection')}
              testID={TestIds.FEATURED_SECTION_ENABLED_TOGGLE}
              thumbColor={isEnabled ? surfaceColor : SWITCH_THUMB_INACTIVE}
              trackColor={{ false: SWITCH_TRACK_INACTIVE, true: borderColor }}
              value={isEnabled}
              onValueChange={handleEnabledToggle}
            />
          </View>

          <View>
            <Text style={[styles.label, { color: textColor }]}>
              {FM('featuredSection.sectionTitleLabel')}
            </Text>
            <TextInput
              accessibilityHint={FM('featuredSection.sectionTitleHint')}
              accessibilityLabel={FM('featuredSection.sectionTitleLabel')}
              placeholder={FM('featuredSection.sectionTitlePlaceholder')}
              style={[styles.input, { borderColor, color: textColor }]}
              testID={TestIds.FEATURED_SECTION_TITLE_INPUT}
              value={String(menuContents.featuredSectionTitle ?? '')}
              onChangeText={handleTitleChange}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default FeaturedSectionSettings;
