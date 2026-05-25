/**
 * FreeTierWatermark - "Powered by MenuFlow" badge for free-tier users.
 * Only renders when the subscription indicates watermark should be shown.
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { WATERMARK_FONT_SIZE, WATERMARK_PADDING } from '../Settings/BillingSettings/constants';

const WATERMARK_OPACITY = 0.7;

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: WATERMARK_PADDING,
  },
  text: {
    fontSize: WATERMARK_FONT_SIZE,
    opacity: WATERMARK_OPACITY,
  },
});

const FreeTierWatermark = (): React.ReactElement => {
  const { theme } = useTheme();

  return (
    <View
      accessibilityHint={FM('settings.billing.watermark.hint')}
      accessibilityLabel={FM('settings.billing.watermark.label')}
      accessibilityRole="text"
      style={styles.container}
      testID={TestIds.FREE_TIER_WATERMARK}
    >
      <Text style={[styles.text, { color: theme.colors.textSecondary }]}>
        {FM('settings.billing.watermark.text')}
      </Text>
    </View>
  );
};

export default FreeTierWatermark;
