/**
 * Styles for MenuContentEditor component.
 */
import { StyleSheet } from 'react-native';

const CONTAINER_PADDING = 16;
const SECTION_MARGIN_BOTTOM = 24;
const TITLE_FONT_SIZE = 18;
const TITLE_MARGIN_BOTTOM = 12;
const BUTTON_PADDING = 10;
const BUTTON_BORDER_RADIUS = 6;
const BUTTON_MARGIN_TOP = 8;
const BUTTON_FONT_SIZE = 14;

export const contentEditorStyles = StyleSheet.create({
  container: { padding: CONTAINER_PADDING },
  section: { marginBottom: SECTION_MARGIN_BOTTOM },
  sectionTitle: { fontSize: TITLE_FONT_SIZE, fontWeight: 'bold', marginBottom: TITLE_MARGIN_BOTTOM },
  button: { padding: BUTTON_PADDING, borderRadius: BUTTON_BORDER_RADIUS, marginTop: BUTTON_MARGIN_TOP },
  buttonText: { fontSize: BUTTON_FONT_SIZE, fontWeight: '600', textAlign: 'center' },
});
