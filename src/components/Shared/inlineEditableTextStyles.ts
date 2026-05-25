/**
 * Styles for InlineEditableText component.
 */
import { StyleSheet } from 'react-native';

const EDIT_ICON_MARGIN_LEFT = 4;
const EDIT_ICON_OPACITY = 0.5;

export const inlineEditableTextStyles = StyleSheet.create({
  displayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    cursor: 'pointer',
  },
  input: {
    fontSize: 16,
    fontWeight: 'bold',
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  editIconWrapper: {
    opacity: EDIT_ICON_OPACITY,
    marginLeft: EDIT_ICON_MARGIN_LEFT,
  },
});
