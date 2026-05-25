import { StyleSheet } from 'react-native';

import { MODAL_OVERLAY_COLOR } from '../../../../shared/constants';

const MODAL_MAX_WIDTH = 480;
const MODAL_BORDER_RADIUS = 12;
const SECTION_PADDING = 16;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_PADDING_VERTICAL = 10;
const BUTTON_PADDING_HORIZONTAL = 16;
const URL_FONT_SIZE = 12;
const MENU_NAME_FONT_SIZE = 18;
const LABEL_FONT_SIZE = 14;
const COLOR_INPUT_HEIGHT = 40;
const ACTIONS_GAP = 8;
const OVERLAY_PADDING = 20;
const SMALL_BORDER_RADIUS = 6;
const SMALL_SPACING = 8;
const TINY_SPACING = 4;
const BUTTON_GAP = 6;

export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: MODAL_OVERLAY_COLOR,
    justifyContent: 'center',
    alignItems: 'center',
    padding: OVERLAY_PADDING,
  },
  content: {
    width: '100%',
    maxWidth: MODAL_MAX_WIDTH,
    borderRadius: MODAL_BORDER_RADIUS,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SECTION_PADDING,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: MENU_NAME_FONT_SIZE,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: SMALL_SPACING,
    borderRadius: SMALL_BORDER_RADIUS,
  },
  closeText: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '600',
  },
  body: {
    padding: SECTION_PADDING,
    alignItems: 'center',
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: SECTION_PADDING,
  },
  menuName: {
    fontSize: MENU_NAME_FONT_SIZE,
    fontWeight: '600',
    marginBottom: SMALL_SPACING,
    textAlign: 'center',
  },
  urlText: {
    fontSize: URL_FONT_SIZE,
    marginTop: SMALL_SPACING,
    textAlign: 'center',
  },
});

export const colorInputStyles = StyleSheet.create({
  container: {
    width: '100%',
    marginBottom: SECTION_PADDING,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SECTION_PADDING,
  },
  inputGroup: {
    flex: 1,
  },
  label: {
    fontSize: LABEL_FONT_SIZE,
    marginBottom: TINY_SPACING,
    fontWeight: '500',
  },
  input: {
    height: COLOR_INPUT_HEIGHT,
    borderWidth: 1,
    borderRadius: SMALL_BORDER_RADIUS,
    paddingHorizontal: SMALL_SPACING,
  },
});

export const actionStyles = StyleSheet.create({
  container: {
    width: '100%',
    gap: ACTIONS_GAP,
  },
  row: {
    flexDirection: 'row',
    gap: ACTIONS_GAP,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: BUTTON_PADDING_VERTICAL,
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    borderRadius: BUTTON_BORDER_RADIUS,
    gap: BUTTON_GAP,
  },
  buttonText: {
    fontWeight: '600',
    fontSize: LABEL_FONT_SIZE,
  },
});
