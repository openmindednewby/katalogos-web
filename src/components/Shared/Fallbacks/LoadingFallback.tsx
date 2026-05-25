/**
 * LoadingFallback - A lightweight loading indicator for lazy-loaded components.
 *
 * Used with React.lazy() and Suspense to show a loading state while
 * heavy components are being loaded. Optimized for minimal bundle impact.
 */
import React from 'react';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 100,
  },
  fullScreen: {
    minHeight: 300,
  },
});

interface Props {
  /** Show as full-screen loader (default: false) */
  fullScreen?: boolean;
  /** Custom size for the spinner */
  size?: 'small' | 'large';
}

const LoadingFallback: React.FC<Props> = ({ fullScreen = false, size = 'large' }) => {
  const { theme } = useTheme();
  const colors = theme.colors;
  const primary = theme.palette.primary['500'];

  return (
    <View
      accessibilityHint={FM('loadingFallback.hint')}
      accessibilityLabel={FM('loadingFallback.label')}
      accessibilityRole="progressbar"
      style={[styles.container, fullScreen && styles.fullScreen, { backgroundColor: colors.background }]}
      testID={TestIds.LOADING_FALLBACK}
    >
      <ActivityIndicator color={primary} size={size} />
    </View>
  );
};

export default LoadingFallback;
