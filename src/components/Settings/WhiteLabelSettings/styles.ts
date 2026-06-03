/**
 * Shared styles for WhiteLabelSettings sub-components.
 */
import { StyleSheet } from 'react-native';

import {
  BODY_FONT_SIZE,
  DESCRIPTION_FONT_SIZE,
  ERROR_TEXT_MARGIN_TOP,
  INPUT_BORDER_RADIUS,
  INPUT_BORDER_WIDTH,
  INPUT_PADDING,
  MEDIUM_SPACING,
  SECTION_SPACING,
  TITLE_FONT_SIZE,
} from '../constants';
import {
  ACTION_BORDER_RADIUS,
  ACTION_PADDING_H,
  ACTION_PADDING_V,
  CSS_TEXTAREA_MIN_HEIGHT,
  SECTION_GAP_HEIGHT,
  TEXTAREA_MIN_HEIGHT,
  TOGGLE_LABEL_FONT_SIZE,
} from './constants';
import { DISABLED_OPACITY } from '../../../shared/constants';

export const whiteLabelStyles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: SECTION_SPACING },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: BODY_FONT_SIZE, textAlign: 'center', marginTop: ERROR_TEXT_MARGIN_TOP },
  description: { fontSize: DESCRIPTION_FONT_SIZE, marginBottom: MEDIUM_SPACING },
  sectionTitle: { fontSize: TITLE_FONT_SIZE, fontWeight: '600', marginBottom: MEDIUM_SPACING },
  label: { fontSize: BODY_FONT_SIZE, fontWeight: '500', marginBottom: MEDIUM_SPACING },
  input: {
    fontSize: BODY_FONT_SIZE,
    borderWidth: INPUT_BORDER_WIDTH,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    marginBottom: MEDIUM_SPACING,
  },
  textarea: {
    fontSize: BODY_FONT_SIZE,
    borderWidth: INPUT_BORDER_WIDTH,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    marginBottom: MEDIUM_SPACING,
    minHeight: TEXTAREA_MIN_HEIGHT,
    textAlignVertical: 'top',
  },
  cssTextarea: {
    fontSize: BODY_FONT_SIZE,
    borderWidth: INPUT_BORDER_WIDTH,
    borderRadius: INPUT_BORDER_RADIUS,
    padding: INPUT_PADDING,
    marginBottom: MEDIUM_SPACING,
    minHeight: CSS_TEXTAREA_MIN_HEIGHT,
    textAlignVertical: 'top',
    fontFamily: 'monospace',
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: MEDIUM_SPACING,
  },
  toggleLabel: { fontSize: TOGGLE_LABEL_FONT_SIZE, flex: 1, marginRight: MEDIUM_SPACING },
  toggleDescription: { fontSize: DESCRIPTION_FONT_SIZE, marginBottom: MEDIUM_SPACING },
  sectionGap: { height: SECTION_GAP_HEIGHT },
  saveButton: {
    paddingVertical: ACTION_PADDING_V,
    paddingHorizontal: ACTION_PADDING_H,
    borderRadius: ACTION_BORDER_RADIUS,
    alignItems: 'center',
  },
  saveText: { fontSize: BODY_FONT_SIZE, fontWeight: '700' },
  disabledButton: { opacity: DISABLED_OPACITY },
});
