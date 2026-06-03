

/**
 * Styles for GlobalStylingTab component.
 */
import { StyleSheet } from 'react-native';

const SECTION_MARGIN = 8;
const SECTION_HEADER_PADDING = 12;
const SECTION_CONTENT_PADDING = 16;
const BORDER_RADIUS = 8;
const BORDER_WIDTH = 1;
const ICON_SIZE = 20;
const TITLE_FONT_SIZE = 14;
const TAB_MARGIN_BOTTOM = 16;
const TRANSPARENT = 'transparent';

export const globalStylingTabStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    marginBottom: TAB_MARGIN_BOTTOM,
  },
  tabScrollView: {
    flexGrow: 0,
  },
  tabScrollContent: {
    flexDirection: 'row',
    gap: 4,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
  },
  tabButtonSelected: {
    borderColor: TRANSPARENT,
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  tabButtonTextSelected: {
    fontWeight: '600',
  },
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
  sectionIcon: {
    fontSize: ICON_SIZE,
  },
  sectionTitle: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
  },
  sectionContent: {
    padding: SECTION_CONTENT_PADDING,
  },
  chevronIcon: {
    fontSize: ICON_SIZE,
  },
});
