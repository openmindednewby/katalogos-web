import { StyleSheet } from 'react-native';

const LIST_MAX_WIDTH = 720;
const HEADER_PADDING = 20;
const TITLE_FONT_SIZE = 28;
const TITLE_MARGIN_BOTTOM = 8;
const SUBTITLE_FONT_SIZE = 16;
const LIST_CONTENT_PADDING = 16;
const EMPTY_PADDING = 40;
const EMPTY_FONT_SIZE = 18;

export const publicMenuListStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerWrapper: {
    maxWidth: LIST_MAX_WIDTH,
    width: '100%',
    alignSelf: 'center',
    flex: 1,
  },
  header: {
    padding: HEADER_PADDING,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: 'bold',
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  subtitle: {
    fontSize: SUBTITLE_FONT_SIZE,
  },
  listContent: {
    padding: LIST_CONTENT_PADDING,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: EMPTY_PADDING,
  },
  emptyText: {
    fontSize: EMPTY_FONT_SIZE,
    textAlign: 'center',
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
