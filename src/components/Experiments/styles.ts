/**
 * Shared styles for the Experiments feature screens.
 */
import { StyleSheet } from 'react-native';

const CONTAINER_PADDING = 16;
const SECTION_GAP = 16;
const CARD_PADDING = 16;
const CARD_BORDER_RADIUS = 10;
const CARD_BORDER_WIDTH = 1;
const CARD_MARGIN_BOTTOM = 12;
const BADGE_PADDING_H = 10;
const BADGE_PADDING_V = 4;
const BADGE_BORDER_RADIUS = 12;
const BADGE_FONT_SIZE = 12;
const TITLE_FONT_SIZE = 14;
const SUBTITLE_FONT_SIZE = 13;
const HEADING_FONT_SIZE = 18;
const DESC_FONT_SIZE = 14;
const BUTTON_PADDING_V = 12;
const BUTTON_PADDING_H = 20;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_FONT_SIZE = 14;
const BAR_HEIGHT = 20;
const BAR_BORDER_RADIUS = 10;
const METRIC_FONT_SIZE = 20;
const METRIC_LABEL_SIZE = 13;
const WINNER_FONT_SIZE = 16;
const BACK_BUTTON_PADDING = 8;

export const experimentStyles = StyleSheet.create({
  container: { flex: 1, padding: CONTAINER_PADDING },
  scrollContent: { paddingBottom: SECTION_GAP },
  heading: { fontSize: HEADING_FONT_SIZE, fontWeight: '700', marginBottom: 4 },
  description: { fontSize: DESC_FONT_SIZE, marginBottom: SECTION_GAP },
  sectionGap: { height: SECTION_GAP },

  // Card
  card: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
    marginBottom: CARD_MARGIN_BOTTOM,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  cardName: { fontSize: TITLE_FONT_SIZE, fontWeight: '600', flex: 1, marginRight: 8 },
  cardMenuLabel: { fontSize: SUBTITLE_FONT_SIZE, marginBottom: 8 },

  // Badge
  badge: { paddingHorizontal: BADGE_PADDING_H, paddingVertical: BADGE_PADDING_V, borderRadius: BADGE_BORDER_RADIUS },
  badgeText: { fontSize: BADGE_FONT_SIZE, fontWeight: '600' },

  // Button
  button: {
    paddingVertical: BUTTON_PADDING_V,
    paddingHorizontal: BUTTON_PADDING_H,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
  },
  buttonText: { fontSize: BUTTON_FONT_SIZE, fontWeight: '700' },

  // Detail
  backButton: { padding: BACK_BUTTON_PADDING, marginBottom: 8 },
  backButtonText: { fontSize: BUTTON_FONT_SIZE },
  controlsRow: { flexDirection: 'row', gap: 12, marginBottom: SECTION_GAP },

  // Metrics
  metricsContainer: { gap: SECTION_GAP },
  metricRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricValue: { fontSize: METRIC_FONT_SIZE, fontWeight: '700' },
  metricLabel: { fontSize: METRIC_LABEL_SIZE },
  barContainer: { height: BAR_HEIGHT, borderRadius: BAR_BORDER_RADIUS, overflow: 'hidden' },
  barFill: { height: BAR_HEIGHT, borderRadius: BAR_BORDER_RADIUS },

  // Winner
  winnerContainer: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
    alignItems: 'center',
  },
  winnerText: { fontSize: WINNER_FONT_SIZE, fontWeight: '700' },

  // Loading
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorContainer: { padding: CONTAINER_PADDING },

  // Create modal
  modalOverlay: { flex: 1, justifyContent: 'center', padding: CONTAINER_PADDING },
  modalContent: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
  },
  modalTitle: { fontSize: HEADING_FONT_SIZE, fontWeight: '700', marginBottom: SECTION_GAP },
  inputLabel: { fontSize: SUBTITLE_FONT_SIZE, marginBottom: 4, fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: BUTTON_BORDER_RADIUS,
    padding: BUTTON_PADDING_V,
    marginBottom: SECTION_GAP,
    fontSize: TITLE_FONT_SIZE,
  },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12 },
  createButtonWrapper: { alignSelf: 'flex-start', marginBottom: SECTION_GAP },
});
