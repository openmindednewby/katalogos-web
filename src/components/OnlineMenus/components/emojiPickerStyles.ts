/** Styles for the EmojiPicker component. */
import { StyleSheet } from 'react-native';

const GRID_GAP = 4;
const EMOJI_CELL_SIZE = 40;
const EMOJI_FONT_SIZE = 22;
const PICKER_BORDER_RADIUS = 8;
const PICKER_PADDING = 12;
const GROUP_LABEL_SIZE = 12;
const GROUP_LABEL_MARGIN_TOP = 8;
const GROUP_LABEL_MARGIN_BOTTOM = 4;
const SELECTED_BORDER_WIDTH = 2;
const EMOJI_BUTTON_SIZE = 36;
const EMOJI_BUTTON_FONT_SIZE = 20;

export const emojiPickerStyles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderRadius: PICKER_BORDER_RADIUS,
    padding: PICKER_PADDING,
    marginTop: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  groupLabel: {
    fontSize: GROUP_LABEL_SIZE,
    fontWeight: '600',
    marginTop: GROUP_LABEL_MARGIN_TOP,
    marginBottom: GROUP_LABEL_MARGIN_BOTTOM,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: GRID_GAP,
  },
  emojiCell: {
    width: EMOJI_CELL_SIZE,
    height: EMOJI_CELL_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  emojiCellSelected: {
    borderWidth: SELECTED_BORDER_WIDTH,
  },
  emojiText: {
    fontSize: EMOJI_FONT_SIZE,
  },
  emojiButton: {
    width: EMOJI_BUTTON_SIZE,
    height: EMOJI_BUTTON_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emojiButtonText: {
    fontSize: EMOJI_BUTTON_FONT_SIZE,
  },
  clearButtonText: {
    fontSize: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
});
