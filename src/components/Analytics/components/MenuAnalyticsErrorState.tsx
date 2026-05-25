import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';
import { layoutStyles } from '@/theme/utils/styles';

const ERROR_FONT_SIZE = 16;
const ERROR_PADDING = 24;
const RETRY_PADDING_VERTICAL = 10;
const RETRY_PADDING_HORIZONTAL = 20;
const RETRY_BORDER_RADIUS = 8;
const RETRY_MARGIN_TOP = 12;
const RETRY_FONT_SIZE = 14;

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: ERROR_PADDING,
  },
  errorText: {
    fontSize: ERROR_FONT_SIZE,
    textAlign: 'center',
  },
  retryButton: {
    paddingVertical: RETRY_PADDING_VERTICAL,
    paddingHorizontal: RETRY_PADDING_HORIZONTAL,
    borderRadius: RETRY_BORDER_RADIUS,
    marginTop: RETRY_MARGIN_TOP,
  },
  retryButtonText: {
    fontSize: RETRY_FONT_SIZE,
    fontWeight: '600',
  },
});

interface MenuAnalyticsErrorStateProps {
  backButton: React.ReactElement;
  onRetry: () => void;
}

const MenuAnalyticsErrorState = ({
  backButton,
  onRetry,
}: MenuAnalyticsErrorStateProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const errorColor = theme.semantic.error['500'];

  return (
    <View
      style={[layoutStyles.container, { backgroundColor: colors.background }]}
      testID={TestIds.MENU_ANALYTICS_SCREEN}
    >
      {backButton}
      <View style={styles.errorContainer} testID={TestIds.MENU_ANALYTICS_ERROR}>
        <Text style={[styles.errorText, { color: errorColor }]}>
          {FM('analytics.detail.error')}
        </Text>
        <TouchableOpacity
          accessibilityHint={FM('analytics.detail.retryHint')}
          accessibilityLabel={FM('analytics.detail.retry')}
          accessibilityRole="button"
          style={[styles.retryButton, { backgroundColor: primary }]}
          testID={TestIds.MENU_ANALYTICS_RETRY_BUTTON}
          onPress={onRetry}
        >
          <Text style={[styles.retryButtonText, { color: colors.background }]}>
            {FM('analytics.detail.retry')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MenuAnalyticsErrorState;
