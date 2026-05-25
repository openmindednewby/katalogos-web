/**
 * CategoryStylingSection - Collapsible styling options for a category.
 *
 * Provides:
 * - BoxStyleEditor for category container styling (borders, padding, shadows)
 * - MediaPositionEditor for category image settings
 */
import React, { useCallback, useState } from 'react';

import { Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { categoryStylingStyles as styles } from './categoryStylingStyles';
import BoxStyleEditor from './Styling/components/BoxStyleEditor';
import MediaPositionEditor from './Styling/components/MediaPositionEditor';
import { TestIds } from '../../shared/testIds';
import MediaFit from '../../types/enums/MediaFit';
import MediaPosition from '../../types/enums/MediaPosition';
import MediaSize from '../../types/enums/MediaSize';
import { SvgIcon } from '../Icons';

import type { BoxStyling, MediaSettings } from '../../types/menuStyleTypes';

// =============================================================================
// Constants
// =============================================================================

const CHEVRON_ICON_SIZE = 16;

const DEFAULT_BOX_STYLING: BoxStyling = {
  borderWidth: 0,
  borderColor: '',
  borderRadius: 0,
  padding: 0,
  shadowEnabled: false,
};

const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  position: MediaPosition.Left,
  size: MediaSize.Medium,
  fit: MediaFit.Cover,
  borderRadius: 0,
};

// =============================================================================
// Props Interface
// =============================================================================

interface CategoryStylingSectionProps {
  categoryIndex: number;
  styling?: BoxStyling;
  imageSettings?: MediaSettings;
  onUpdateStyling: (styling: BoxStyling) => void;
  onUpdateImageSettings: (settings: MediaSettings) => void;
  textColor: string;
  borderColor: string;
  backgroundColor: string;
}

// =============================================================================
// Component
// =============================================================================

const CategoryStylingSection: React.FC<CategoryStylingSectionProps> = ({
  categoryIndex,
  styling,
  imageSettings,
  onUpdateStyling,
  onUpdateImageSettings,
  textColor,
  borderColor,
  backgroundColor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleStylingChange = useCallback(
    (newStyling: BoxStyling) => {
      onUpdateStyling(newStyling);
    },
    [onUpdateStyling],
  );

  const handleImageSettingsChange = useCallback(
    (newSettings: MediaSettings) => {
      onUpdateImageSettings(newSettings);
    },
    [onUpdateImageSettings],
  );

  const chevronName = isExpanded ? 'chevronUp' : 'chevronDown';
  const currentStyling = styling ?? DEFAULT_BOX_STYLING;
  const currentImageSettings = imageSettings ?? DEFAULT_MEDIA_SETTINGS;

  return (
    <View
      style={[styles.container, { borderColor }]}
      testID={`${TestIds.CATEGORY_STYLING_SECTION}-${categoryIndex}`}
    >
      <TouchableOpacity
        accessibilityHint={isExpanded ? 'Collapse styling options' : 'Expand styling options'}
        accessibilityLabel={FM('categoryEditor.stylingSection')}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        style={[styles.header, { backgroundColor }]}
        testID={`${TestIds.CATEGORY_STYLING_TOGGLE}-${categoryIndex}`}
        onPress={handleToggle}
      >
        <Text style={[styles.headerTitle, { color: textColor }]}>
          {FM('categoryEditor.stylingSection')}
        </Text>
        <SvgIcon color={textColor} name={chevronName} size={CHEVRON_ICON_SIZE} />
      </TouchableOpacity>

      {isExpanded ? (
        <View
          style={styles.content}
          testID={`${TestIds.CATEGORY_STYLING_CONTENT}-${categoryIndex}`}
        >
          {/* Box Style Editor */}
          <View
            style={styles.editorSection}
            testID={`${TestIds.CATEGORY_STYLING_BOX_EDITOR}-${categoryIndex}`}
          >
            <BoxStyleEditor
              label={FM('categoryEditor.containerStyling')}
              value={currentStyling}
              onChange={handleStylingChange}
            />
          </View>

          {/* Media Position Editor */}
          <View
            style={styles.editorSection}
            testID={`${TestIds.CATEGORY_STYLING_MEDIA_EDITOR}-${categoryIndex}`}
          >
            <MediaPositionEditor
              value={currentImageSettings}
              onChange={handleImageSettingsChange}
            />
          </View>
        </View>
      ) : null}
    </View>
  );
};

export default CategoryStylingSection;
