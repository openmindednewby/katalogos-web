/**
 * Shared styles for dietary tag components.
 */
import { StyleSheet } from 'react-native';

import {
  BADGE_BORDER_RADIUS,
  BADGE_FONT_SIZE,
  BADGE_GAP,
  BADGE_ICON_SIZE,
  BADGE_PADDING_HORIZONTAL,
  BADGE_PADDING_VERTICAL,
  CHIP_BORDER_WIDTH,
  CHIP_MARGIN_BOTTOM,
  CHIP_MARGIN_RIGHT,
  FILTER_CHIP_BORDER_RADIUS,
  FILTER_CHIP_PADDING_HORIZONTAL,
  FILTER_CHIP_PADDING_VERTICAL,
  SECTION_MARGIN_BOTTOM,
  SELECTOR_CHIP_BORDER_RADIUS,
  SELECTOR_CHIP_PADDING_HORIZONTAL,
  SELECTOR_CHIP_PADDING_VERTICAL,
} from './dietaryTagConstants';

export const badgeStyles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BADGE_BORDER_RADIUS,
    paddingHorizontal: BADGE_PADDING_HORIZONTAL,
    paddingVertical: BADGE_PADDING_VERTICAL,
    gap: BADGE_GAP,
  },
  badgeText: {
    fontSize: BADGE_FONT_SIZE,
    fontWeight: '600',
  },
  iconText: {
    fontSize: BADGE_ICON_SIZE,
  },
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: BADGE_GAP,
  },
});

export const selectorStyles = StyleSheet.create({
  container: {
    marginBottom: SECTION_MARGIN_BOTTOM,
  },
  label: {
    fontWeight: '600',
    marginBottom: CHIP_MARGIN_BOTTOM,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipWrapper: {
    marginRight: CHIP_MARGIN_RIGHT,
    marginBottom: CHIP_MARGIN_BOTTOM,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: SELECTOR_CHIP_BORDER_RADIUS,
    paddingHorizontal: SELECTOR_CHIP_PADDING_HORIZONTAL,
    paddingVertical: SELECTOR_CHIP_PADDING_VERTICAL,
    borderWidth: CHIP_BORDER_WIDTH,
    gap: BADGE_GAP,
  },
  chipText: {
    fontSize: BADGE_FONT_SIZE,
    fontWeight: '500',
  },
  emptyText: {
    fontStyle: 'italic',
  },
});

export const filterStyles = StyleSheet.create({
  container: {
    marginBottom: SECTION_MARGIN_BOTTOM,
  },
  scrollContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chipWrapper: {
    marginRight: CHIP_MARGIN_RIGHT,
    marginBottom: CHIP_MARGIN_BOTTOM,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: FILTER_CHIP_BORDER_RADIUS,
    paddingHorizontal: FILTER_CHIP_PADDING_HORIZONTAL,
    paddingVertical: FILTER_CHIP_PADDING_VERTICAL,
    borderWidth: CHIP_BORDER_WIDTH,
    gap: BADGE_GAP,
  },
  chipText: {
    fontWeight: '500',
  },
  clearButton: {
    borderRadius: FILTER_CHIP_BORDER_RADIUS,
    paddingHorizontal: FILTER_CHIP_PADDING_HORIZONTAL,
    paddingVertical: FILTER_CHIP_PADDING_VERTICAL,
    borderWidth: CHIP_BORDER_WIDTH,
    marginRight: CHIP_MARGIN_RIGHT,
    marginBottom: CHIP_MARGIN_BOTTOM,
  },
  clearButtonText: {
    fontWeight: '500',
  },
});
