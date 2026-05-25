/**
 * Reusable button for the cookie consent banner.
 * Supports primary (filled) and secondary (outlined) variants.
 */
import React, { useMemo } from 'react';

import { StyleSheet, TouchableOpacity, Text } from 'react-native';

const BORDER_RADIUS = 8;
const PADDING_VERTICAL = 10;
const PADDING_HORIZONTAL = 16;
const BORDER_WIDTH = 1;
const FONT_SIZE = 14;
const MIN_MARGIN_TOP = 8;

const styles = StyleSheet.create({
  base: {
    borderRadius: BORDER_RADIUS,
    paddingVertical: PADDING_VERTICAL,
    paddingHorizontal: PADDING_HORIZONTAL,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDER_WIDTH,
    minWidth: PADDING_HORIZONTAL * 2,
    marginTop: MIN_MARGIN_TOP,
  },
  label: {
    fontSize: FONT_SIZE,
    fontWeight: '600',
  },
});

interface ConsentButtonProps {
  label: string;
  testID: string;
  textColor: string;
  onPress: () => void;
  a11yHint: string;
  primary?: boolean;
  primaryColor?: string;
  borderColor?: string;
}

const ConsentButton = ({
  label,
  testID,
  textColor,
  onPress,
  a11yHint,
  primary = false,
  primaryColor,
  borderColor,
}: ConsentButtonProps): React.ReactElement => {
  const buttonStyle = useMemo(
    () => [
      styles.base,
      {
        backgroundColor: primary ? (primaryColor ?? 'transparent') : 'transparent',
        borderColor: primary ? (primaryColor ?? 'transparent') : (borderColor ?? 'transparent'),
      },
    ],
    [primary, primaryColor, borderColor],
  );

  return (
    <TouchableOpacity
      accessibilityHint={a11yHint}
      accessibilityLabel={label}
      accessibilityRole="button"
      style={buttonStyle}
      testID={testID}
      onPress={onPress}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
};

export default ConsentButton;
