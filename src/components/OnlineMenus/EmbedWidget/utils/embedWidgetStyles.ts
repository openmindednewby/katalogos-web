import { StyleSheet } from 'react-native';

import { MODAL_OVERLAY_COLOR } from '../../../../shared/constants';

const MODAL_MAX_WIDTH = 480;
const MODAL_BORDER_RADIUS = 12;
const SECTION_PADDING = 16;
const LABEL_FONT_SIZE = 14;
const TITLE_FONT_SIZE = 18;
const OVERLAY_PADDING = 20;
const SMALL_BORDER_RADIUS = 6;
const SMALL_SPACING = 8;

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
  body: {
    padding: SECTION_PADDING,
    alignItems: 'center',
  },
});
