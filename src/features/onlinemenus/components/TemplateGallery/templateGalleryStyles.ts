import { StyleSheet } from 'react-native';

const CARD_WIDTH = 140;
const CARD_PADDING = 12;
const CARD_BORDER_RADIUS = 10;
const CARD_BORDER_WIDTH = 2;
const CARD_GAP = 10;
const ICON_FONT_SIZE = 28;
const NAME_FONT_SIZE = 13;
const DESCRIPTION_FONT_SIZE = 11;
const NAME_MARGIN_TOP = 8;
const DESCRIPTION_MARGIN_TOP = 4;
const SECTION_MARGIN_TOP = 16;
const TITLE_FONT_SIZE = 15;
const SUBTITLE_FONT_SIZE = 13;
const SUBTITLE_MARGIN_TOP = 4;
const SCROLL_MARGIN_TOP = 10;
const SCROLL_PADDING_RIGHT = 4;

export const templateGalleryStyles = StyleSheet.create({
  container: { marginTop: SECTION_MARGIN_TOP },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: '600', textAlign: 'center' },
  subtitle: { fontSize: SUBTITLE_FONT_SIZE, textAlign: 'center', marginTop: SUBTITLE_MARGIN_TOP },
  scrollContent: { gap: CARD_GAP, marginTop: SCROLL_MARGIN_TOP, paddingRight: SCROLL_PADDING_RIGHT },
  card: {
    width: CARD_WIDTH,
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: CARD_BORDER_WIDTH,
    alignItems: 'center',
  },
  cardIcon: { fontSize: ICON_FONT_SIZE },
  cardName: { fontSize: NAME_FONT_SIZE, fontWeight: '600', marginTop: NAME_MARGIN_TOP, textAlign: 'center' },
  cardDescription: { fontSize: DESCRIPTION_FONT_SIZE, marginTop: DESCRIPTION_MARGIN_TOP, textAlign: 'center' },
});
