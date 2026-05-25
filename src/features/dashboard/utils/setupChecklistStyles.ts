import { StyleSheet } from 'react-native';

const CARD_PADDING = 20;
const CARD_BORDER_RADIUS = 12;
const CARD_MARGIN_BOTTOM = 16;
const BORDER_WIDTH = 1;
const HEADER_MARGIN_BOTTOM = 16;
const TITLE_FONT_SIZE = 18;
const PROGRESS_FONT_SIZE = 14;
const PROGRESS_MARGIN_TOP = 4;
const PROGRESS_BAR_HEIGHT = 6;
const PROGRESS_BAR_RADIUS = 3;
const PROGRESS_BAR_MARGIN_TOP = 8;
const DISMISS_FONT_SIZE = 14;
const ITEM_PADDING_VERTICAL = 12;
const ITEM_GAP = 12;
const CHECKMARK_SIZE = 24;
const CHECKMARK_BORDER_RADIUS = 12;
const CHECKMARK_BORDER_WIDTH = 2;
const CHECKMARK_FONT_SIZE = 14;
const ITEM_LABEL_FONT_SIZE = 15;

export const checklistStyles = StyleSheet.create({
  card: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    marginBottom: CARD_MARGIN_BOTTOM,
    borderWidth: BORDER_WIDTH,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: HEADER_MARGIN_BOTTOM,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '700',
  },
  progressText: {
    fontSize: PROGRESS_FONT_SIZE,
    marginTop: PROGRESS_MARGIN_TOP,
  },
  progressBarTrack: {
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: PROGRESS_BAR_RADIUS,
    marginTop: PROGRESS_BAR_MARGIN_TOP,
  },
  progressBarFill: {
    height: PROGRESS_BAR_HEIGHT,
    borderRadius: PROGRESS_BAR_RADIUS,
  },
  dismissText: {
    fontSize: DISMISS_FONT_SIZE,
    fontWeight: '600',
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: ITEM_PADDING_VERTICAL,
    gap: ITEM_GAP,
  },
  checkmark: {
    width: CHECKMARK_SIZE,
    height: CHECKMARK_SIZE,
    borderRadius: CHECKMARK_BORDER_RADIUS,
    borderWidth: CHECKMARK_BORDER_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkIcon: {
    fontSize: CHECKMARK_FONT_SIZE,
    fontWeight: '700',
  },
  itemLabel: {
    fontSize: ITEM_LABEL_FONT_SIZE,
    flex: 1,
  },
  completedLabel: {
    textDecorationLine: 'line-through',
  },
});
