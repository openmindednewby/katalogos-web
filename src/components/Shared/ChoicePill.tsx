import React from 'react';

import { StyleSheet, Text, TouchableOpacity, type StyleProp, type TextStyle, type ViewStyle } from 'react-native';

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

  const pillStyle = React.useMemo(
    () => [styles.pill, { backgroundColor: selected ? theme.palette.primary['100'] : TRANSPARENT_COLOR }, style],
    [theme.palette.primary, selected, style],
  );
  const textStyle = React.useMemo<TextStyle>(
    () => ({ color: selected ? theme.palette.primary['500'] : theme.colors.text }),
    [theme, selected],
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
