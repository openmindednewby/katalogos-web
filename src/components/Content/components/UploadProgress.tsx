


/**
 * Upload progress indicator component.
 *
 * Shows upload progress with a progress bar, file name, and cancel button.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { DISABLED_OPACITY } from '../../../shared/constants';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------


const CANCEL_TEXT_COLOR = '#ffffff';
const PROGRESS_MIN = 0;
const PROGRESS_MAX = 100;

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  cancelButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 4,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressContainer: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    marginTop: 4,
    textAlign: 'right',
  },
});

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Props {
  fileName: string;
  progress: number;
  onCancel: () => void;
  disabled?: boolean;
}

interface ThemeStyles {
  container: ViewStyle;
  fileName: TextStyle;
  cancelButton: ViewStyle;
  cancelText: TextStyle;
  progressContainer: ViewStyle;
  progressBar: ViewStyle;
  progressText: TextStyle;
}

interface ThemeColors {
  surface: string;
  border: string;
  text: string;
  error: string;
  primary: string;
  textSecondary: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createContainerStyles(colors: ThemeColors): { container: ViewStyle; fileName: TextStyle } {
  return {
    container: { backgroundColor: colors.surface, borderColor: colors.border },
    fileName: { color: colors.text },
  };
}

function createCancelStyles(colors: ThemeColors, disabled: boolean): { button: ViewStyle; text: TextStyle } {
  return {
    button: { backgroundColor: colors.error, opacity: disabled ? DISABLED_OPACITY : 1 },
    text: { color: CANCEL_TEXT_COLOR },
  };
}

function createProgressStyles(colors: ThemeColors, progress: number): { container: ViewStyle; bar: ViewStyle; text: TextStyle } {
  const clampedProgress = Math.min(PROGRESS_MAX, Math.max(PROGRESS_MIN, progress));
  return {
    container: { backgroundColor: colors.border },
    bar: { backgroundColor: colors.primary, width: `${clampedProgress}%` },
    text: { color: colors.textSecondary },
  };
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export const UploadProgress = ({
  fileName,
  progress,
  onCancel,
  disabled = false,
}: Props): React.ReactElement => {
  const { theme } = useTheme();

  const themeStyles = useMemo<ThemeStyles>(() => {
    const themeColors: ThemeColors = {
      surface: theme.colors.surface,
      border: theme.colors.border,
      text: theme.colors.text,
      error: theme.semantic.error['500'],
      primary: theme.palette.primary['500'],
      textSecondary: theme.colors.textSecondary,
    };
    const containerStyles = createContainerStyles(themeColors);
    const cancelStyles = createCancelStyles(themeColors, disabled);
    const progressStyles = createProgressStyles(themeColors, progress);

    return {
      container: containerStyles.container,
      fileName: containerStyles.fileName,
      cancelButton: cancelStyles.button,
      cancelText: cancelStyles.text,
      progressContainer: progressStyles.container,
      progressBar: progressStyles.bar,
      progressText: progressStyles.text,
    };
  }, [theme, progress, disabled]);

  const progressPercent = Math.min(100, Math.max(0, Math.round(progress)));

  return (
    <View
      style={[styles.container, themeStyles.container]}
      testID={TestIds.UPLOAD_PROGRESS_CONTAINER}
    >
      <View style={styles.header}>
        <Text
          ellipsizeMode="middle"
          numberOfLines={1}
          style={[styles.fileName, themeStyles.fileName]}
          testID={TestIds.UPLOAD_PROGRESS_FILE_NAME}
        >
          {fileName}
        </Text>
        <TouchableOpacity
          accessibilityHint={FM('content.cancelUploadHint')}
          accessibilityLabel={FM('content.cancelUploadLabel')}
          accessibilityRole="button"
          disabled={disabled}
          style={[styles.cancelButton, themeStyles.cancelButton]}
          testID={TestIds.UPLOAD_PROGRESS_CANCEL_BUTTON}
          onPress={onCancel}
        >
          <Text style={[styles.cancelText, themeStyles.cancelText]}>{FM('content.cancelUpload')}</Text>
        </TouchableOpacity>
      </View>
      <View style={[styles.progressContainer, themeStyles.progressContainer]}>
        <View
          style={[styles.progressBar, themeStyles.progressBar]}
          testID={TestIds.UPLOAD_PROGRESS_BAR}
        />
      </View>
      <Text style={[styles.progressText, themeStyles.progressText]}>
        {progressPercent}%
      </Text>
    </View>
  );
}
