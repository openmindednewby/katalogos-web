/**
 * Styles for CategoryStylingSection component.
 */
import { StyleSheet } from 'react-native';

const BORDER_RADIUS = 8;
const BORDER_WIDTH = 1;
const HEADER_PADDING = 12;
const CONTENT_PADDING = 16;
const SECTION_MARGIN = 12;

export const categoryStylingStyles = StyleSheet.create({
  container: {
    marginTop: 16,
    borderRadius: BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HEADER_PADDING,
    paddingVertical: HEADER_PADDING,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  chevron: {
    fontSize: 16,
  },
  content: {
    padding: CONTENT_PADDING,
  },
  editorSection: {
    marginBottom: SECTION_MARGIN,
  },
});
