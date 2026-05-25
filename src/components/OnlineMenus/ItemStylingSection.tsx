/**
 * ItemStylingSection - Collapsible section for menu item styling options.
 *
 * Provides editors for:
 * - Box styling (borders, padding, shadows)
 * - Media position settings
 * - Price style formatting
 */
import React, { useCallback, useState } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import BoxStyleEditor from './Styling/components/BoxStyleEditor';
import MediaPositionEditor from './Styling/components/MediaPositionEditor';
import PriceStyleEditor from './Styling/components/PriceStyleEditor';
import { TestIds } from '../../shared/testIds';
import CurrencyPosition from '../../types/enums/CurrencyPosition';
import FontWeight from '../../types/enums/FontWeight';
import MediaFit from '../../types/enums/MediaFit';
import MediaPosition from '../../types/enums/MediaPosition';
import MediaSize from '../../types/enums/MediaSize';
import { SvgIcon } from '../Icons';

import type { BoxStyling, MediaSettings, PriceStyle } from '../../types/menuStyleTypes';
import type { MenuItem } from '../../types/menuTypes';

// =============================================================================
// Constants
// =============================================================================

const CHEVRON_ICON_SIZE = 16;
const SECTION_PADDING = 12;
const BORDER_RADIUS = 6;
const BORDER_WIDTH = 1;
const TITLE_FONT_SIZE = 14;
const CONTENT_PADDING = 16;
const SECTION_GAP = 16;

// =============================================================================
// Styles
// =============================================================================

const styles = StyleSheet.create({
  container: {
    marginTop: SECTION_PADDING,
    borderRadius: BORDER_RADIUS,
    borderWidth: BORDER_WIDTH,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SECTION_PADDING,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
  },
  content: {
    padding: CONTENT_PADDING,
    gap: SECTION_GAP,
  },
});

// =============================================================================
// Props Interface
// =============================================================================

interface Props {
  item: MenuItem;
  onUpdate: (updates: Partial<MenuItem>) => void;
  borderColor: string;
  textColor: string;
  surfaceColor: string;
}

// =============================================================================
// Default Values
// =============================================================================

const DEFAULT_BOX_STYLING: BoxStyling = {
  padding: 0,
  borderWidth: 0,
  borderRadius: 0,
  borderColor: '',
  shadowEnabled: false,
};

const DEFAULT_MEDIA_SETTINGS: MediaSettings = {
  position: MediaPosition.Left,
  size: MediaSize.Medium,
  fit: MediaFit.Cover,
  borderRadius: 0,
};

const DEFAULT_PRICE_STYLE: PriceStyle = {
  fontSize: 16,
  fontWeight: FontWeight.Bold,
  color: '',
  currencyPosition: CurrencyPosition.Before,
  showCurrency: true,
  strikethroughWhenUnavailable: true,
};

// =============================================================================
// Component
// =============================================================================

const ItemStylingSection: React.FC<Props> = ({
  item,
  onUpdate,
  borderColor,
  textColor,
  surfaceColor,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleBoxStyleChange = useCallback(
    (styling: BoxStyling) => {
      onUpdate({ styling });
    },
    [onUpdate],
  );

  const handleMediaSettingsChange = useCallback(
    (imageSettings: MediaSettings) => {
      onUpdate({ imageSettings });
    },
    [onUpdate],
  );

  const handlePriceStyleChange = useCallback(
    (priceStyle: PriceStyle) => {
      onUpdate({ priceStyle });
    },
    [onUpdate],
  );

  const chevronName = isExpanded ? 'chevronUp' : 'chevronDown';
  const hintAction = isExpanded ? 'collapse' : 'expand';
  const currentBoxStyling = item.styling ?? DEFAULT_BOX_STYLING;
  const currentMediaSettings = item.imageSettings ?? DEFAULT_MEDIA_SETTINGS;
  const currentPriceStyle = item.priceStyle ?? DEFAULT_PRICE_STYLE;

  return (
    <View
      style={[styles.container, { borderColor }]}
      testID={TestIds.ITEM_STYLING_SECTION}
    >
      <TouchableOpacity
        accessibilityHint={FM('itemStyling.toggleHint', hintAction)}
        accessibilityLabel={FM('itemStyling.title')}
        accessibilityRole="button"
        accessibilityState={{ expanded: isExpanded }}
        style={[styles.header, { backgroundColor: surfaceColor }]}
        testID={TestIds.ITEM_STYLING_HEADER}
        onPress={handleToggle}
      >
        <Text style={[styles.title, { color: textColor }]}>
          {FM('itemStyling.title')}
        </Text>
        <SvgIcon color={textColor} name={chevronName} size={CHEVRON_ICON_SIZE} />
      </TouchableOpacity>

      {isExpanded ? (
        <View style={styles.content} testID={TestIds.ITEM_STYLING_CONTENT}>
          <BoxStyleEditor
            label={FM('itemStyling.containerStyle')}
            value={currentBoxStyling}
            onChange={handleBoxStyleChange}
          />

          <MediaPositionEditor
            value={currentMediaSettings}
            onChange={handleMediaSettingsChange}
          />

          <PriceStyleEditor
            value={currentPriceStyle}
            onChange={handlePriceStyleChange}
          />
        </View>
      ) : null}
    </View>
  );
};

export default ItemStylingSection;
