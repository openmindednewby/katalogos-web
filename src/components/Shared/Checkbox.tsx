import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { useTheme } from '../../theme/hooks/useTheme';
import { layoutStyles } from '../../theme/utils/styles';

const TRANSPARENT_COLOR = 'transparent';
const CHECKMARK_TEXT_COLOR = '#fff';
const CHECKMARK_SYMBOL = '\u2713';

interface Props {
  label?: string;
  isChecked: boolean;
  onPress: () => void;
  /** Optional localized label for checked state. Defaults to i18n `quizTemplates.yes`. */
  yesLabel?: string;
  /** Optional localized label for unchecked state. Defaults to i18n `quizTemplates.no`. */
  noLabel?: string;
  /** If true (default) the checkbox will append the yes/no state to the provided label. */
  baseLabel?: string;
  testID?: string;
}

const styles = StyleSheet.create({
  boxUnchecked: { backgroundColor: TRANSPARENT_COLOR },
  checkMark: { color: CHECKMARK_TEXT_COLOR, fontSize: 12 },
});

const Checkbox = ({ label, isChecked, onPress, yesLabel, noLabel, baseLabel, testID }: Props): React.ReactElement => {
  const { theme } = useTheme();
  const { colors, palette } = theme;
  const primaryColor = palette.primary['500'];

  // Build the displayed label. If showStateInLabel is true and a base label is provided,
  // append ": Yes" or ": No" (localized) depending on `isChecked`.
  function renderLabel(): string {
    const yes = yesLabel ?? FM('quizTemplates.yes');
    const no = noLabel ?? FM('quizTemplates.no');

    if (typeof baseLabel !== 'string' || baseLabel === '') return isChecked ? yes : no;
    return `${baseLabel} ${isChecked ? yes : no}`;
  }

  const resolvedLabel = typeof label === 'string' && label !== '' ? label : renderLabel();
  const checkboxBoxStyle = React.useMemo(
    () => [
      layoutStyles.checkboxBox,
      { borderColor: colors.border },
      isChecked ? { backgroundColor: primaryColor } : styles.boxUnchecked,
    ],
    [colors.border, primaryColor, isChecked],
  );
  const labelTextStyle = React.useMemo(
    () => [layoutStyles.checkboxLabel, { color: colors.text }],
    [colors.text],
  );

  return (
    <TouchableOpacity
      accessibilityHint={FM('checkbox.toggleHint')}
      accessibilityLabel={resolvedLabel}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: Boolean(isChecked) }}
      style={[layoutStyles.checkboxRow, layoutStyles.sectionSpacing]}
      testID={testID ?? 'checkbox'}
      onPress={onPress}
    >
      <View style={checkboxBoxStyle}>
        {isChecked ? <Text style={styles.checkMark}>{CHECKMARK_SYMBOL}</Text> : null}
      </View>
      <Text style={labelTextStyle}>{resolvedLabel}</Text>
    </TouchableOpacity>
  );
};

export default Checkbox;
