import React from 'react';

import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';
import { layoutStyles } from '@/theme/utils/styles';

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

interface MenuAnalyticsLoadingStateProps {
  backButton: React.ReactElement;
}

const MenuAnalyticsLoadingState = ({
  backButton,
}: MenuAnalyticsLoadingStateProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];

  return (
    <View
      style={[layoutStyles.container, { backgroundColor: colors.background }]}
      testID={TestIds.MENU_ANALYTICS_SCREEN}
    >
      {backButton}
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          color={primary}
          size="large"
          testID={TestIds.MENU_ANALYTICS_LOADING}
        />
        <Text style={{ color: colors.textSecondary }}>
          {FM('analytics.detail.loading')}
        </Text>
      </View>
    </View>
  );
};

export default MenuAnalyticsLoadingState;
