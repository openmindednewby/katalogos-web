/**
 * Styles for MenuItemEditorBody component.
 */
import { StyleSheet } from 'react-native';

const LABEL_FONT_SIZE = 14;
const LABEL_MARGIN_BOTTOM = 8;
const LABEL_MARGIN_TOP = 12;
const INPUT_BORDER_WIDTH = 1;
const INPUT_BORDER_RADIUS = 8;
const INPUT_PADDING = 12;
const INPUT_FONT_SIZE = 16;
const BUTTON_PADDING = 10;
const BUTTON_BORDER_RADIUS = 6;
const BUTTON_MARGIN_TOP = 8;
const BUTTON_FONT_SIZE = 14;
const SMALLER_MARGIN_TOP = 8;

export const itemEditorStyles = StyleSheet.create({
  label: { fontSize: LABEL_FONT_SIZE, fontWeight: '600', marginBottom: LABEL_MARGIN_BOTTOM, marginTop: LABEL_MARGIN_TOP },
  labelMarginTop: { marginTop: SMALLER_MARGIN_TOP },
  input: { borderWidth: INPUT_BORDER_WIDTH, borderRadius: INPUT_BORDER_RADIUS, padding: INPUT_PADDING, fontSize: INPUT_FONT_SIZE },
  button: { padding: BUTTON_PADDING, borderRadius: BUTTON_BORDER_RADIUS, marginTop: BUTTON_MARGIN_TOP },
  buttonText: { fontSize: BUTTON_FONT_SIZE, fontWeight: '600', textAlign: 'center' },
});
