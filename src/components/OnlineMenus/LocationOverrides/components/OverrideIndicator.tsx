/**
 * OverrideIndicator - Visual badge shown on items that have location-specific overrides.
 * Displays a small colored dot and "Overridden" text.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';

interface OverrideIndicatorProps {
  primaryColor: string;
  textOnPrimary: string;
}

const DOT_SIZE = 8;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  text: { fontSize: 11, fontWeight: '700' },
});

const OverrideIndicator: React.FC<OverrideIndicatorProps> = ({ primaryColor, textOnPrimary }) => (
  <View
    accessibilityHint={FM('onlineMenus.locationOverrides.overriddenHint')}
    accessibilityLabel={FM('onlineMenus.locationOverrides.overridden')}
    style={[styles.container, { backgroundColor: primaryColor }]}
    testID={TestIds.OVERRIDE_INDICATOR}
  >
    <View style={[styles.dot, { backgroundColor: textOnPrimary }]} />
    <Text style={[styles.text, { color: textOnPrimary }]}>
      {FM('onlineMenus.locationOverrides.overridden')}
    </Text>
  </View>
);

export default OverrideIndicator;
