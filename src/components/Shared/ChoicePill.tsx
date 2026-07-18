import React from 'react';

import { StyleSheet, Text, TouchableOpacity, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

import { badgeColors } from '@dloizides/theme-web';

import { FM } from '@/localization/helpers';

import { useTheme } from '../../theme/hooks/useTheme';

const TRANSPARENT_COLOR = 'transparent';

const styles = StyleSheet.create({
  pill: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: TRANSPARENT_COLOR,
  },
});

interface Props {
  label: React.ReactNode;
  selected?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  testID?: string;
}

const ChoicePill = ({ label, selected = false, onPress, style, testID }: Props): React.ReactElement => {
  const { theme } = useTheme();

  // The selected pill is a text-on-tint pair, and it shipped as the naive
  // `primary['500']` on `primary['100']`. That FAILED AA on four of the five
  // bundled presets — 3.35:1 on Tag Heuer, 3.86 on Forest, 3.87 on Sunset, 4.40
  // on Ocean — and only cleared on Default (5.42:1). It is not a tuning problem:
  // `500` is the tenant's seed verbatim and `100` is a tint of it, so the ratio
  // tracks the seed's luminance, which nothing constrains. `badgeColors` measures
  // per seed and returns the lightest shade that provably clears floor + margin.
  const selectedColors = React.useMemo(
    () => badgeColors(theme.palette.primary),
    [theme.palette.primary],
  );

  const pillStyle = React.useMemo(
    () => [styles.pill, { backgroundColor: selected ? selectedColors.backgroundColor : TRANSPARENT_COLOR }, style],
    [selectedColors, selected, style],
  );
  const textStyle = React.useMemo<TextStyle>(
    () => ({ color: selected ? selectedColors.color : theme.colors.text }),
    [selectedColors, theme, selected],
  );

  const derivedLabel = typeof label === 'string' ? label : undefined;

  return (
    <TouchableOpacity
      accessibilityHint={FM('choicePill.selectHint')}
      accessibilityLabel={derivedLabel}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      style={pillStyle}
      testID={testID ?? 'choice-pill'}
      onPress={onPress}
    >
      <Text style={textStyle}>{label}</Text>
    </TouchableOpacity>
  );
};

export default ChoicePill;
