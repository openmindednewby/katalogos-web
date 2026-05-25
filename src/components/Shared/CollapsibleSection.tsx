/**
 * CollapsibleSection - Reusable collapsible section with header and content.
 *
 * Promoted from OnlineMenus/Styling to Shared. Self-contained styles (no
 * product-specific imports). Accepts theme colors via props.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { SvgIcon } from '../Icons';

import type { IconName } from '../Icons';

// =============================================================================
// Constants
// =============================================================================

const CHEVRON_DOWN: IconName = 'chevronDown';
const CHEVRON_UP: IconName = 'chevronUp';
const CHEVRON_ICON_SIZE = 16;
const SECTION_MARGIN = 8;
const SECTION_HEADER_PADDING = 12;
const SECTION_CONTENT_PADDING = 16;
const BORDER_RADIUS = 8;
const BORDER_WIDTH = 1;
const TITLE_FONT_SIZE = 14;

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  sectionContainer: {
    marginVertical: SECTION_MARGIN,
    borderRadius: BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SECTION_HEADER_PADDING,
    paddingVertical: SECTION_HEADER_PADDING,
  },
  sectionHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionTitle: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
  },
  sectionContent: {
    padding: SECTION_CONTENT_PADDING,
  },
});

// =============================================================================
// Props Interface
// =============================================================================

interface Props {
  title: string;
  testId: string;
  isExpanded: boolean;
  onToggle: () => void;
  disabled?: boolean;
  textColor: string;
  surfaceColor: string;
  borderColor: string;
  children: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
  headerStyle?: StyleProp<ViewStyle>;
}

// =============================================================================
// Component
// =============================================================================

const CollapsibleSection: React.FC<Props> = ({
  title,
  testId,
  isExpanded,
  onToggle,
  disabled = false,
  textColor,
  surfaceColor,
  borderColor,
  children,
  containerStyle,
  headerStyle,
}) => {
  const chevronName = isExpanded ? CHEVRON_UP : CHEVRON_DOWN;

  return (
    <View style={[styles.sectionContainer, { borderColor }, containerStyle]} testID={testId}>
      <TouchableOpacity
        accessibilityHint={FM('common.toggleSectionHint')}
        accessibilityLabel={title}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        disabled={disabled}
        style={[styles.sectionHeader, { backgroundColor: surfaceColor }, headerStyle]}
        testID={`${testId}-header`}
        onPress={onToggle}
      >
        <View style={styles.sectionHeaderContent}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>{title}</Text>
        </View>
        <SvgIcon color={textColor} name={chevronName} size={CHEVRON_ICON_SIZE} />
      </TouchableOpacity>

      {isExpanded ? (
        <View style={styles.sectionContent} testID={`${testId}-content`}>
          {children}
        </View>
      ) : null}
    </View>
  );
};

export default CollapsibleSection;
