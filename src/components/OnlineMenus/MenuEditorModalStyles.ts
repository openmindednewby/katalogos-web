import { StyleSheet } from 'react-native';

import { MODAL_OVERLAY_COLOR } from '../../shared/constants';

const PHONE_MODAL_PADDING = 12;
const MODAL_MAX_WIDTH = 720;
const HEADER_FONT_SIZE = 24;
const HEADER_MARGIN_BOTTOM = 24;
const LABEL_FONT_SIZE = 15;
const LABEL_MARGIN_TOP = 20;
const INPUT_PADDING = 14;
const INPUT_FONT_SIZE = 16;
const TEXT_AREA_MIN_HEIGHT = 120;
const BUTTON_ROW_MARGIN_TOP = 28;
const OVERLAY_PADDING = 24;

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: OVERLAY_PADDING,
  },
  overlayPhone: {
    padding: 0,
  },
  modalContent: {
    width: '100%',
    maxWidth: MODAL_MAX_WIDTH,
    maxHeight: '90%',
    borderRadius: 12,
    padding: OVERLAY_PADDING,
  },
  modalContentPhone: {
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 0,
    padding: PHONE_MODAL_PADDING,
    flex: 1,
  },
  header: {
    fontSize: HEADER_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: HEADER_MARGIN_BOTTOM,
  },
  label: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: LABEL_MARGIN_TOP,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: INPUT_PADDING,
    fontSize: INPUT_FONT_SIZE,
  },
  textArea: {
    minHeight: TEXT_AREA_MIN_HEIGHT,
    textAlignVertical: 'top',
  },
  errorText: {
    fontSize: 12,
    marginTop: 4,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: BUTTON_ROW_MARGIN_TOP,
  },
  buttonRowPhone: {
    flexDirection: 'column',
  },
  button: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  buttonPhone: {
    minWidth: 0,
  },
  buttonText: {
    fontSize: INPUT_FONT_SIZE,
    fontWeight: '600',
  },
});
