import type { ReactElement } from 'react';
import { useState } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';

interface Props {
  question: string;
  answer: string;
  /** Hint resolved by caller for screen reader users. */
  toggleHint: string;
}

const QUESTION_FONT_SIZE = 17;
const ANSWER_FONT_SIZE = 15;
const ITEM_PADDING_VERTICAL = 20;
const ANSWER_LINE_HEIGHT = 24;
const TOGGLE_ICON_SIZE = 20;
const COLLAPSED_SIGN = '+';
const EXPANDED_SIGN = '−';
const DEFAULT_BORDER_WIDTH = 1;

const styles = StyleSheet.create({
  outer: { borderBottomWidth: DEFAULT_BORDER_WIDTH },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: ITEM_PADDING_VERTICAL,
  },
  question: { fontSize: QUESTION_FONT_SIZE, fontWeight: '600', flex: 1, paddingRight: 16 },
  toggleSign: { fontSize: TOGGLE_ICON_SIZE, fontWeight: '500' },
  answer: {
    fontSize: ANSWER_FONT_SIZE,
    lineHeight: ANSWER_LINE_HEIGHT,
    paddingBottom: ITEM_PADDING_VERTICAL,
  },
});

/**
 * Single collapsible FAQ entry. Tap the question row to toggle the answer.
 */
const FaqItem = ({ question, answer, toggleHint }: Props): ReactElement => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const colors = theme.colors;

  function handleToggle(): void {
    setOpen((prev) => !prev);
  }

  return (
    <View style={[styles.outer, { borderBottomColor: colors.border }]} testID={TestIds.LANDING_FAQ_ITEM}>
      <TouchableOpacity
        accessibilityHint={toggleHint}
        accessibilityLabel={question}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.row}
        onPress={handleToggle}
      >
        <Text style={[styles.question, { color: colors.text }]}>{question}</Text>
        <Text style={[styles.toggleSign, { color: colors.textSecondary }]}>
          {open ? EXPANDED_SIGN : COLLAPSED_SIGN}
        </Text>
      </TouchableOpacity>
      {open ? (
        <Text style={[styles.answer, { color: colors.textSecondary }]}>{answer}</Text>
      ) : null}
    </View>
  );
};

export default FaqItem;
