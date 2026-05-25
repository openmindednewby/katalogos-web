import { StyleSheet } from 'react-native';

import { DISABLED_OPACITY } from '@/shared/constants';

const INPUT_PADDING = 14;
const INPUT_BORDER_RADIUS = 8;
const INPUT_FONT_SIZE = 16;
const BORDER_WIDTH = 1;
const BUTTON_PADDING_VERTICAL = 14;
const BUTTON_BORDER_RADIUS = 8;
const BUTTON_FONT_SIZE = 16;
const BUTTON_MARGIN_TOP = 20;
const SKIP_MARGIN_TOP = 16;
const SKIP_FONT_SIZE = 14;
const MIN_TOUCH_TARGET = 44;
const TITLE_FONT_SIZE = 24;
const SUBTITLE_FONT_SIZE = 15;
const SUBTITLE_MARGIN_TOP = 8;
const LOGO_SECTION_MARGIN_TOP = 24;

export const INPUT_MARGIN_TOP = 24;
export const FULL_OPACITY = 1;
export { DISABLED_OPACITY };

export const wizardContentStyles = StyleSheet.create({
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: '700', textAlign: 'center' },
  subtitle: { fontSize: SUBTITLE_FONT_SIZE, textAlign: 'center', marginTop: SUBTITLE_MARGIN_TOP },
  input: {
    padding: INPUT_PADDING,
    borderRadius: INPUT_BORDER_RADIUS,
    fontSize: INPUT_FONT_SIZE,
    borderWidth: BORDER_WIDTH,
    marginTop: INPUT_MARGIN_TOP,
  },
  ctaButton: {
    paddingVertical: BUTTON_PADDING_VERTICAL,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
    marginTop: BUTTON_MARGIN_TOP,
  },
  ctaText: { fontSize: BUTTON_FONT_SIZE, fontWeight: '600' },
  skipButton: { marginTop: SKIP_MARGIN_TOP, alignItems: 'center', minHeight: MIN_TOUCH_TARGET, justifyContent: 'center' },
  skipText: { fontSize: SKIP_FONT_SIZE },
  logoSection: { marginTop: LOGO_SECTION_MARGIN_TOP },
});
