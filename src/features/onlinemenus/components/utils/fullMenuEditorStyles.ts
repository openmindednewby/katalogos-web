import { StyleSheet } from 'react-native';

import { MODAL_OVERLAY_COLOR } from '@/shared/constants';

const PHONE_MODAL_PADDING = 12;
const MODAL_PADDING = 24;
const HEADER_FONT_SIZE = 24;
const HEADER_MARGIN_BOTTOM = 20;
const OVERLAY_PADDING = 20;
const BUTTON_FONT_SIZE = 16;
const BUTTON_PADDING_H = 20;
const BUTTON_PADDING_V = 12;
const BUTTON_RADIUS = 8;
const BUTTON_MIN_WIDTH = 100;
const BUTTON_ROW_MARGIN_TOP = 24;
const BUTTON_ROW_PADDING_TOP = 16;
const TOOLBAR_GAP = 8;
const BUTTON_ROW_GAP = 12;
const BORDER_RADIUS = 12;

// Desktop two-pane layout (>= EDITOR_TWO_PANE_BREAKPOINT_PX)
const TWO_PANE_GAP = 20;
const LEFT_PANE_FLEX = 58;
const RIGHT_PANE_FLEX = 42;
const LEFT_PANE_MIN_WIDTH = 420;
const RIGHT_PANE_MIN_WIDTH = 320;
const LIVE_PANE_HEADER_PADDING = 12;
const LIVE_PANE_TITLE_FONT_SIZE = 16;

export const fullEditorStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: MODAL_OVERLAY_COLOR, justifyContent: 'center', alignItems: 'center', padding: OVERLAY_PADDING },
  overlayPhone: { padding: 0 },
  modalContent: { width: '90%', maxHeight: '95%', borderRadius: BORDER_RADIUS, padding: MODAL_PADDING },
  modalContentPhone: { width: '100%', maxHeight: '100%', borderRadius: 0, padding: PHONE_MODAL_PADDING, flex: 1 },
  header: { fontSize: HEADER_FONT_SIZE, fontWeight: 'bold', marginBottom: HEADER_MARGIN_BOTTOM },
  toolbarRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: TOOLBAR_GAP },
  toolbarRowPhone: { flexWrap: 'wrap' },
  contentContainer: { flex: 1 },
  // Desktop two-pane body: editor form (left) + live preview (right).
  bodyRow: { flex: 1, flexDirection: 'row', gap: TWO_PANE_GAP },
  leftPane: { flex: LEFT_PANE_FLEX, minWidth: LEFT_PANE_MIN_WIDTH },
  rightPane: { flex: RIGHT_PANE_FLEX, minWidth: RIGHT_PANE_MIN_WIDTH, borderLeftWidth: 1 },
  livePaneHeader: { paddingHorizontal: LIVE_PANE_HEADER_PADDING, paddingVertical: LIVE_PANE_HEADER_PADDING, borderBottomWidth: 1 },
  livePaneTitle: { fontSize: LIVE_PANE_TITLE_FONT_SIZE, fontWeight: '600' },
  buttonRow: { flexDirection: 'row', justifyContent: 'flex-end', gap: BUTTON_ROW_GAP, marginTop: BUTTON_ROW_MARGIN_TOP, paddingTop: BUTTON_ROW_PADDING_TOP, borderTopWidth: 1 },
  buttonRowPhone: { flexDirection: 'column' },
  button: { paddingHorizontal: BUTTON_PADDING_H, paddingVertical: BUTTON_PADDING_V, borderRadius: BUTTON_RADIUS, minWidth: BUTTON_MIN_WIDTH, alignItems: 'center' },
  buttonPhone: { minWidth: 0 },
  buttonText: { fontSize: BUTTON_FONT_SIZE, fontWeight: '600' },
});
