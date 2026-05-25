import type { ReactElement } from 'react';

import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import FaqItem from './FaqItem';
import { FM } from '../../../localization/helpers';
import { TABLET_BREAKPOINT_PX } from '../../../shared/constants';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import {
  LANDING_MAX_WIDTH,
  LANDING_SECTION_PADDING_HORIZONTAL,
  LANDING_SECTION_PADDING_VERTICAL,
} from '../constants';

interface FaqEntry {
  questionKey: string;
  answerKey: string;
}

interface Props {
  /** Translation key for the section heading (e.g. "landing.faq.sectionTitle"). */
  sectionTitleKey: string;
  /** Hint key resolved by FM, used for screen-reader toggle hint on every item. */
  toggleHintKey: string;
  /** Q&A entries — keys resolved via FM at render time. */
  entries: readonly FaqEntry[];
}

const SECTION_TITLE_DESKTOP = 32;
const SECTION_TITLE_MOBILE = 26;
const SECTION_TITLE_MARGIN_BOTTOM = 32;
const FAQ_MAX_WIDTH = 760;

const styles = StyleSheet.create({
  outer: { width: '100%', alignItems: 'center' },
  inner: {
    width: '100%',
    maxWidth: LANDING_MAX_WIDTH,
    paddingHorizontal: LANDING_SECTION_PADDING_HORIZONTAL,
    paddingVertical: LANDING_SECTION_PADDING_VERTICAL,
    alignItems: 'center',
  },
  sectionTitle: {
    fontWeight: '800',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: SECTION_TITLE_MARGIN_BOTTOM,
  },
  list: { width: '100%', maxWidth: FAQ_MAX_WIDTH },
});

/**
 * Frequently-asked-questions accordion section for the landing page.
 * Each entry is a collapsible FaqItem; first paint shows all collapsed.
 */
const FaqSection = ({ sectionTitleKey, toggleHintKey, entries }: Props): ReactElement => {
  const { theme } = useTheme();
  const { width } = useWindowDimensions();

  const isMobile = width <= TABLET_BREAKPOINT_PX;
  const titleSize = isMobile ? SECTION_TITLE_MOBILE : SECTION_TITLE_DESKTOP;
  const toggleHint = FM(toggleHintKey);

  return (
    <View style={styles.outer} testID={TestIds.LANDING_FAQ_SECTION}>
      <View style={styles.inner}>
        <Text style={[styles.sectionTitle, { fontSize: titleSize, color: theme.colors.text }]}>
          {FM(sectionTitleKey)}
        </Text>
        <View style={styles.list}>
          {entries.map((entry) => (
            <FaqItem
              key={entry.questionKey}
              answer={FM(entry.answerKey)}
              question={FM(entry.questionKey)}
              toggleHint={toggleHint}
            />
          ))}
        </View>
      </View>
    </View>
  );
};

export default FaqSection;
