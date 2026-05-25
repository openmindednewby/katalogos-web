import type { ReactElement } from 'react';

import { Platform, StyleSheet, View } from 'react-native';

import { PoweredByFooter } from '@dloizides/ui-primitives';

const ATTRIBUTION_PADDING_VERTICAL = 12;

const styles = StyleSheet.create({
  container: { width: '100%', alignItems: 'center', paddingVertical: ATTRIBUTION_PADDING_VERTICAL },
});

/**
 * Wraps the cross-portfolio "built by dloizides.com" attribution.
 *
 * The shared @dloizides/ui-primitives PoweredByFooter is a web-DOM component
 * (renders <div>/<a> tags). On native platforms it's a no-op — the attribution
 * is web-only because the marketing landings are web-only.
 */
const AttributionFooter = (): ReactElement | null => {
  if (Platform.OS !== 'web') return null;

  return (
    <View style={styles.container}>
      <PoweredByFooter testID="landing-powered-by" />
    </View>
  );
};

export default AttributionFooter;
