

/**
 * HeaderEditorPreview Component
 *
 * Preview component for the header editor showing logo and title layout.
 */
import React, { useMemo } from 'react';

import { Text, View } from 'react-native';
import type { ViewStyle } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../../shared/testIds';
import HorizontalPosition from '../../../../types/enums/HorizontalPosition';
import { LOGO_SIZE_DIMENSIONS, PREVIEW_BACKGROUND, PREVIEW_LOGO_PLACEHOLDER } from '../utils/headerEditorConstants';
import { headerEditorStyles as styles } from '../utils/headerEditorStyles';

import type { LogoSize } from '../../../../types/menuStyleTypes';

// =============================================================================
// Types
// =============================================================================

interface Props {
  showLogo: boolean;
  logoPosition: HorizontalPosition;
  logoSize: LogoSize;
  showMenuName: boolean;
  showMenuDescription: boolean;
  titlePosition: HorizontalPosition;
  textColor: string;
  textSecondary: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

function getAlignItems(position: HorizontalPosition): ViewStyle['alignItems'] {
  if (position === HorizontalPosition.Left) return 'flex-start';
  if (position === HorizontalPosition.Right) return 'flex-end';
  return 'center';
}

function getAlignSelf(position: HorizontalPosition): ViewStyle['alignSelf'] {
  if (position === HorizontalPosition.Left) return 'flex-start';
  if (position === HorizontalPosition.Right) return 'flex-end';
  return 'center';
}

// =============================================================================
// Component
// =============================================================================

const HeaderEditorPreview = ({
  showLogo,
  logoPosition,
  logoSize,
  showMenuName,
  showMenuDescription,
  titlePosition,
  textColor,
  textSecondary,
}: Props): React.ReactElement => {

  const previewAlignmentStyle = useMemo<ViewStyle>(
    () => ({ alignItems: getAlignItems(titlePosition) }),
    [titlePosition],
  );

  const logoAlignmentStyle = useMemo<ViewStyle>(
    () => ({ alignSelf: getAlignSelf(logoPosition) }),
    [logoPosition],
  );

  const logoSizeValue = LOGO_SIZE_DIMENSIONS[logoSize];

  return (
    <View style={styles.previewContainer}>
      <Text style={[styles.previewLabel, { color: textSecondary }]}>
        {FM('headerEditor.preview')}
      </Text>
      <View
        style={[styles.previewBox, { backgroundColor: PREVIEW_BACKGROUND }, previewAlignmentStyle]}
        testID={TestIds.HEADER_EDITOR_PREVIEW}
      >
        {showLogo ? (
          <View style={[styles.previewLogoContainer, logoAlignmentStyle]}>
            <View
              style={[
                styles.previewLogo,
                { width: logoSizeValue, height: logoSizeValue, backgroundColor: PREVIEW_LOGO_PLACEHOLDER },
              ]}
            />
          </View>
        ) : null}
        {showMenuName ? (
          <Text style={[styles.previewTitle, { color: textColor }]}>
            {FM('headerEditor.previewTitle')}
          </Text>
        ) : null}
        {showMenuDescription ? (
          <Text style={[styles.previewDescription, { color: textSecondary }]}>
            {FM('headerEditor.previewDescription')}
          </Text>
        ) : null}
      </View>
    </View>
  );
};

export default HeaderEditorPreview;
