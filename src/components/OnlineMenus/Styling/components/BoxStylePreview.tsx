

/**
 * BoxStylePreview Component
 *
 * Displays a preview box with the current styling applied.
 * Used within BoxStyleEditor to show real-time preview of changes.
 */
import React, { useMemo } from 'react';

import { Platform, Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import {
  DEFAULT_PREVIEW_BACKGROUND,
  DEFAULT_PREVIEW_BORDER,
  DEFAULT_SHADOW_OFFSET_X,
  DEFAULT_SHADOW_OFFSET_Y,
  DEFAULT_SHADOW_OPACITY,
  DEFAULT_SHADOW_RADIUS,
  isValidHexColor,
} from '../utils/boxStyleEditorConstants';
import { boxStyleEditorStyles as styles } from '../utils/boxStyleEditorStyles';

import type { BoxStyling } from '../../../../types/menuStyleTypes';

/** Default shadow color for native platform shadow */
const DEFAULT_SHADOW_COLOR = '#000000';

// =============================================================================
// Types
// =============================================================================

interface Props {
  value: BoxStyling;
  textColor: string;
  textSecondary: string;
}

// =============================================================================
// Component
// =============================================================================

const BoxStylePreview: React.FC<Props> = ({ textColor, textSecondary, value }) => {

  const borderColor = value.borderColor ?? '';
  const borderWidth = value.borderWidth ?? 0;
  const borderRadius = value.borderRadius ?? 0;
  const padding = value.padding ?? 0;
  const shadowEnabled = value.shadowEnabled ?? false;

  const previewStyles = useMemo<ViewStyle>(() => {
    const previewBorder = isValidHexColor(borderColor) ? borderColor : DEFAULT_PREVIEW_BORDER;

    const baseStyles: ViewStyle = {
      backgroundColor: DEFAULT_PREVIEW_BACKGROUND,
      borderColor: previewBorder,
      borderWidth,
      borderRadius,
      padding,
    };

    if (shadowEnabled)
      return {
        ...baseStyles,
        ...Platform.select({
          web: { boxShadow: `${DEFAULT_SHADOW_OFFSET_X}px ${DEFAULT_SHADOW_OFFSET_Y}px ${DEFAULT_SHADOW_RADIUS}px rgba(0, 0, 0, ${DEFAULT_SHADOW_OPACITY})` },
          default: { shadowColor: DEFAULT_SHADOW_COLOR, shadowOffset: { width: DEFAULT_SHADOW_OFFSET_X, height: DEFAULT_SHADOW_OFFSET_Y }, shadowOpacity: DEFAULT_SHADOW_OPACITY, shadowRadius: DEFAULT_SHADOW_RADIUS },
        }),
        elevation: DEFAULT_SHADOW_RADIUS,
      };

    return baseStyles;
  }, [borderColor, borderWidth, borderRadius, padding, shadowEnabled]);

  return (
    <View style={styles.previewContainer}>
      <Text style={[styles.previewLabel, { color: textSecondary }]}>
        {FM('boxStyle.preview')}
      </Text>
      <View style={[styles.previewBox, previewStyles]} testID={TestIds.BOX_STYLE_PREVIEW}>
        <Text style={[styles.previewText, { color: textColor }]}>
          {FM('boxStyle.previewText')}
        </Text>
      </View>
    </View>
  );
};

export default BoxStylePreview;
