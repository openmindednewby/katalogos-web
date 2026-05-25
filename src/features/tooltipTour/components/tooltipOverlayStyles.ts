import type { ViewStyle, TextStyle } from 'react-native';
import { StyleSheet } from 'react-native';

const TOOLTIP_MAX_WIDTH = 320;
const TOOLTIP_PADDING = 16;
const TOOLTIP_BORDER_RADIUS = 12;
const TOOLTIP_SHADOW_RADIUS = 8;
const TOOLTIP_SHADOW_OFFSET_Y = 4;
const TOOLTIP_SHADOW_OPACITY = 0.25;
const TITLE_FONT_SIZE = 16;
const DESCRIPTION_FONT_SIZE = 14;
const DESCRIPTION_LINE_HEIGHT = 20;
const COUNTER_FONT_SIZE = 12;
const BUTTON_FONT_SIZE = 14;
const BUTTON_PADDING_VERTICAL = 8;
const BUTTON_PADDING_HORIZONTAL = 16;
const BUTTON_BORDER_RADIUS = 6;
const FOOTER_MARGIN_TOP = 12;
const TITLE_MARGIN_BOTTOM = 4;
const DESCRIPTION_MARGIN_BOTTOM = 8;
const SPOTLIGHT_BORDER_WIDTH = 2;
const SPOTLIGHT_BORDER_RADIUS = 8;
const BUTTON_ROW_GAP = 8;
const OVERLAY_Z_BACKDROP = 9998;
const OVERLAY_Z_BASE = 9999;
const OVERLAY_Z_SPOTLIGHT = 10000;
const OVERLAY_Z_BUBBLE = 10001;

export { MODAL_OVERLAY_COLOR as BACKDROP_COLOR } from '@/shared/constants';
export const SPOTLIGHT_PADDING = 8;
export const POSITION_OFFSET = 12;

interface OverlayStyleSheet {
  backdrop: ViewStyle;
  overlay: ViewStyle;
  spotlight: ViewStyle;
  bubble: ViewStyle;
  title: TextStyle;
  description: TextStyle;
  footer: ViewStyle;
  counter: TextStyle;
  buttonRow: ViewStyle;
  button: ViewStyle;
  buttonText: TextStyle;
}

export const overlayStyles: OverlayStyleSheet = StyleSheet.create<OverlayStyleSheet>({
  backdrop: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: OVERLAY_Z_BACKDROP,
  },
  overlay: {
    position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
    zIndex: OVERLAY_Z_BASE,
  },
  spotlight: {
    position: 'absolute',
    borderWidth: SPOTLIGHT_BORDER_WIDTH,
    borderRadius: SPOTLIGHT_BORDER_RADIUS,
    zIndex: OVERLAY_Z_SPOTLIGHT,
  },
  bubble: {
    position: 'absolute',
    maxWidth: TOOLTIP_MAX_WIDTH,
    padding: TOOLTIP_PADDING,
    borderRadius: TOOLTIP_BORDER_RADIUS,
    zIndex: OVERLAY_Z_BUBBLE,
    shadowOffset: { width: 0, height: TOOLTIP_SHADOW_OFFSET_Y },
    shadowOpacity: TOOLTIP_SHADOW_OPACITY,
    shadowRadius: TOOLTIP_SHADOW_RADIUS,
  },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: '700', marginBottom: TITLE_MARGIN_BOTTOM },
  description: {
    fontSize: DESCRIPTION_FONT_SIZE,
    lineHeight: DESCRIPTION_LINE_HEIGHT,
    marginBottom: DESCRIPTION_MARGIN_BOTTOM,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: FOOTER_MARGIN_TOP,
  },
  counter: { fontSize: COUNTER_FONT_SIZE },
  buttonRow: { flexDirection: 'row', gap: BUTTON_ROW_GAP },
  button: {
    paddingVertical: BUTTON_PADDING_VERTICAL,
    paddingHorizontal: BUTTON_PADDING_HORIZONTAL,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  buttonText: { fontSize: BUTTON_FONT_SIZE, fontWeight: '600' },
});
