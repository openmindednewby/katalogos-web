

import { StyleSheet } from 'react-native';

import { DISABLED_OPACITY } from '../../../../shared/constants';

// Style constants
const SECTION_MARGIN_VERTICAL = 8;
const SECTION_TITLE_FONT_SIZE = 16;
const SECTION_TITLE_MARGIN_BOTTOM = 12;
const LABEL_FONT_SIZE = 14;
const LABEL_MARGIN_BOTTOM = 8;
const BUTTON_GAP = 8;
const BUTTON_PADDING_HORIZONTAL = 12;
const BUTTON_PADDING_VERTICAL = 8;
const BUTTON_BORDER_RADIUS = 6;
const BUTTON_BORDER_WIDTH = 1;
const BUTTON_FONT_SIZE = 12;
const PREVIEW_SIZE = 120;
const PREVIEW_BORDER_RADIUS = 8;
const PREVIEW_BORDER_WIDTH = 1;
const PREVIEW_IMAGE_SIZE = 40;
const PREVIEW_CONTENT_SIZE = 60;
const TOGGLE_ROW_GAP = 12;
const SLIDER_HEIGHT = 40;

export const mediaPositionEditorStyles = StyleSheet.create({
  container: {
    marginVertical: SECTION_MARGIN_VERTICAL,
  },
  sectionTitle: {
    fontSize: SECTION_TITLE_FONT_SIZE,
    fontWeight: '600',
    marginBottom: SECTION_TITLE_MARGIN_BOTTOM,
  },
  sectionContainer: {
    marginBottom: SECTION_TITLE_MARGIN_BOTTOM,
  },
  sectionLabel: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '500',
    marginBottom: LABEL_MARGIN_BOTTOM,
  },
  buttonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: BUTTON_GAP,
  },
  optionButton: {
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    paddingVertical: BUTTON_PADDING_VERTICAL,
    borderRadius: BUTTON_BORDER_RADIUS,
    borderWidth: BUTTON_BORDER_WIDTH,
  },
  optionButtonText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '500',
  },
  previewContainer: {
    alignItems: 'center',
    marginTop: SECTION_TITLE_MARGIN_BOTTOM,
    marginBottom: SECTION_MARGIN_VERTICAL,
  },
  previewBox: {
    width: PREVIEW_SIZE,
    height: PREVIEW_SIZE,
    borderRadius: PREVIEW_BORDER_RADIUS,
    borderWidth: PREVIEW_BORDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    width: '100%',
  },
  previewColumn: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    height: '100%',
  },
  previewImage: {
    width: PREVIEW_IMAGE_SIZE,
    height: PREVIEW_IMAGE_SIZE,
    borderRadius: BUTTON_BORDER_RADIUS,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewContent: {
    width: PREVIEW_CONTENT_SIZE,
    height: PREVIEW_CONTENT_SIZE,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewText: {
    fontSize: BUTTON_FONT_SIZE,
  },
  previewBackgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewOverlayContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: BUTTON_PADDING_HORIZONTAL,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOGGLE_ROW_GAP,
    marginBottom: SECTION_MARGIN_VERTICAL,
  },
  toggleLabel: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '500',
  },
  sliderContainer: {
    marginBottom: SECTION_MARGIN_VERTICAL,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: TOGGLE_ROW_GAP,
  },
  slider: {
    flex: 1,
    height: SLIDER_HEIGHT,
  },
  sliderValue: {
    fontSize: LABEL_FONT_SIZE,
    fontWeight: '500',
    minWidth: 24,
    textAlign: 'center',
  },
  disabled: {
    opacity: DISABLED_OPACITY,
  },
});
