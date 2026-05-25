/**
 * AriaLiveRegion - Announces dynamic content changes to screen readers.
 *
 * Renders a visually hidden text node with `accessibilityLiveRegion`
 * so assistive technology reads the updated message aloud.
 *
 * @example
 * <AriaLiveRegion message={FM('publicMenu.filter.resultsCount', String(count))} />
 */
import React from 'react';

import { StyleSheet, Text, View } from 'react-native';

import { TestIds } from '@/shared/testIds';

const styles = StyleSheet.create({
  hidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    overflow: 'hidden',
    opacity: 0,
  },
});

interface AriaLiveRegionProps {
  message: string;
  /** @default "polite" */
  politeness?: 'polite' | 'assertive';
}

const AriaLiveRegion: React.FC<AriaLiveRegionProps> = ({
  message,
  politeness = 'polite',
}) => (
  <View
    accessibilityLiveRegion={politeness}
    style={styles.hidden}
    testID={TestIds.ARIA_LIVE_REGION}
  >
    <Text>{message}</Text>
  </View>
);

export default AriaLiveRegion;
