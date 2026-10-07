import type { ReactElement } from 'react';

import { Platform, StyleSheet, View } from 'react-native';

import { PoweredByFooter } from '@dloizides/ui-primitives';

const ATTRIBUTION_PADDING_VERTICAL = 12;

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', paddingVertical: ATTRIBUTION_PADDING_VERTICAL },
});

/** Wraps the cross-portfolio "built by dloizides.com" attribution. */
const AttributionFooter = (): ReactElement | null => {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.container}>
      <PoweredByFooter testID="landing-powered-by" />
    </View>
  );
};

export default AttributionFooter;
