import { useEffect } from 'react';
import type { ReactElement } from 'react';

import { View, ActivityIndicator } from 'react-native';

import { useRouter } from 'expo-router';

import { featureFlags } from '../../config/featureFlags';
import { Routes } from '../../navigation/routes';
import themeStyles from '../../theme/utils/styles';

import type { FeatureFlags } from '../../config/featureFlags';

interface Props {
  /** The feature flag key to check */
  flag: keyof FeatureFlags;
  /** Content to render when the feature is enabled */
  children: ReactElement;
}

/**
 * Gates content behind a feature flag.
 * Redirects to home when the flag is disabled.
 */
const FeatureGate = ({ flag, children }: Props): ReactElement => {
  const router = useRouter();
  const isEnabled = featureFlags[flag];

  useEffect(() => {
    if (!isEnabled) router.replace(Routes.DASHBOARD);
  }, [isEnabled, router]);

  if (!isEnabled)
    return (
      <View style={themeStyles.containerCenter}>
        <ActivityIndicator />
      </View>
    );

  return children;
};

export default FeatureGate;
