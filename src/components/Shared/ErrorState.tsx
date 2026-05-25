/**
 * ErrorState - generic error display with optional retry button.
 *
 * Replaces scattered inline error states across the app.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MESSAGE_FONT_SIZE = 16;
const CONTAINER_PADDING = 20;
const BUTTON_MARGIN_TOP = 12;
const BUTTON_PADDING_V = 8;
const BUTTON_PADDING_H = 16;
const BUTTON_BORDER_RADIUS = 6;
const BUTTON_FONT_SIZE = 14;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: CONTAINER_PADDING,
  },
  message: {
    fontSize: MESSAGE_FONT_SIZE,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: BUTTON_MARGIN_TOP,
    paddingVertical: BUTTON_PADDING_V,
    paddingHorizontal: BUTTON_PADDING_H,
    borderRadius: BUTTON_BORDER_RADIUS,
  },
  retryText: {
    fontSize: BUTTON_FONT_SIZE,
    fontWeight: '600',
  },
});

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface Props {
  message: string;
  onRetry?: () => void;
  testID?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ErrorState = ({
  message,
  onRetry,
  testID = TestIds.ERROR_STATE,
}: Props): React.ReactElement => {
  const { theme } = useTheme();
  const errorColor = theme.semantic.error['500'];
  const primary = theme.palette.primary['500'];

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.message, { color: errorColor }]}>{message}</Text>
      {isValueDefined(onRetry) ? (
        <TouchableOpacity
          accessibilityHint={FM('common.retryHint')}
          accessibilityLabel={FM('common.retry')}
          accessibilityRole="button"
          style={[styles.retryButton, { backgroundColor: primary }]}
          testID={TestIds.ERROR_STATE_RETRY}
          onPress={onRetry}
        >
          <Text style={[styles.retryText, { color: theme.colors.surfaceElevated }]}>
            {FM('common.retry')}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

export default ErrorState;
