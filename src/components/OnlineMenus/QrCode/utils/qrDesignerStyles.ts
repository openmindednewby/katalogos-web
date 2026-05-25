import { StyleSheet } from 'react-native';

import { MODAL_OVERLAY_COLOR } from '../../../../shared/constants';

const MODAL_MAX_WIDTH = 640;
const MODAL_BORDER_RADIUS = 12;
const SECTION_PADDING = 16;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_PADDING_VERTICAL = 10;
const BUTTON_PADDING_HORIZONTAL = 16;
const LABEL_FONT_SIZE = 14;
const TITLE_FONT_SIZE = 18;
const OVERLAY_PADDING = 20;
const SMALL_BORDER_RADIUS = 6;
const SMALL_SPACING = 8;
const TINY_SPACING = 4;
const ACTIONS_GAP = 8;
const INPUT_HEIGHT = 40;
const TEMPLATE_CARD_SIZE = 80;
const TEMPLATE_CARD_BORDER_WIDTH = 2;
const PREVIEW_MAX_HEIGHT = 400;
const SCROLL_VIEW_MAX_HEIGHT = 520;
const BUTTON_GAP = 6;

export const designerModalStyles = StyleSheet.create({
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
    maxHeight: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SECTION_PADDING,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: TITLE_FONT_SIZE,
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
  scrollBody: {
    maxHeight: SCROLL_VIEW_MAX_HEIGHT,
  },
  body: {
    padding: SECTION_PADDING,
    gap: SECTION_PADDING,
  },
});

export const templateSelectorStyles = StyleSheet.create({
  container: {
    gap: SMALL_SPACING,
  },
  label: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '600',
  },
  scrollContent: {
    flexDirection: 'row',
    gap: SMALL_SPACING,
  },
  card: {
    width: TEMPLATE_CARD_SIZE,
    height: TEMPLATE_CARD_SIZE,
    borderRadius: SMALL_BORDER_RADIUS,
    borderWidth: TEMPLATE_CARD_BORDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    padding: TINY_SPACING,
  },
  cardLabel: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: TINY_SPACING,
  },
});

export const previewStyles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: SMALL_SPACING,
  },
  svgWrapper: {
    maxHeight: PREVIEW_MAX_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  hiddenSource: {
    position: 'absolute',
    opacity: 0,
    pointerEvents: 'none',
  },
});

export const customizePanelStyles = StyleSheet.create({
  container: {
    gap: SECTION_PADDING,
  },
  row: {
    flexDirection: 'row',
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
    height: INPUT_HEIGHT,
    borderWidth: 1,
    borderRadius: SMALL_BORDER_RADIUS,
    paddingHorizontal: SMALL_SPACING,
  },
});

export const downloadActionsStyles = StyleSheet.create({
  container: {
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
