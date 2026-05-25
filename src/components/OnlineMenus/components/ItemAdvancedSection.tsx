/** ItemAdvancedSection - Advanced settings for a menu item (styling, seasonal, featured, overrides). */
import React from 'react';

import FeaturedItemControls from '../FeaturedItemControls';
import ItemStylingSection from '../ItemStylingSection';
import { ItemOverrideControls } from '../LocationOverrides';
import SeasonalAvailabilityPicker from './SeasonalAvailabilityPicker';
import { isValueDefined } from '../../../utils/is';

import type { MenuItem } from '../../../types/menuTypes';
import type { OverrideContextProps } from '../LocationOverrides';

interface ItemAdvancedSectionProps {
  item: MenuItem;
  categoryIndex: number;
  itemIndex: number;
  borderColor: string;
  textColor: string;
  textSecondary: string;
  backgroundColor: string;
  primaryColor: string;
  textOnPrimary: string;
  onUpdate: (updates: Partial<MenuItem>) => void;
  overrideContext?: OverrideContextProps;
}

const ItemAdvancedSection: React.FC<ItemAdvancedSectionProps> = ({
  item, categoryIndex, itemIndex,
  borderColor, textColor, textSecondary, backgroundColor, primaryColor, textOnPrimary,
  onUpdate, overrideContext,
}) => (
  <>
    <ItemStylingSection
      borderColor={borderColor}
      item={item}
      surfaceColor={backgroundColor}
      textColor={textColor}
      onUpdate={onUpdate}
    />

    <SeasonalAvailabilityPicker
      availableFrom={item.availableFrom}
      availableTo={item.availableTo}
      backgroundColor={backgroundColor}
      borderColor={borderColor}
      primaryColor={primaryColor}
      textColor={textColor}
      textOnPrimary={textOnPrimary}
      textSecondary={textSecondary}
      onUpdate={(from, to) => { onUpdate({ availableFrom: from, availableTo: to }); }}
    />

    <FeaturedItemControls
      borderColor={borderColor}
      item={item}
      surfaceColor={backgroundColor}
      textColor={textColor}
      onUpdate={onUpdate}
    />

    {isValueDefined(overrideContext) ? (
      <ItemOverrideControls
        backgroundColor={backgroundColor}
        basePrice={item.price}
        borderColor={borderColor}
        categoryIndex={categoryIndex}
        itemIndex={itemIndex}
        override={overrideContext.getOverride(categoryIndex, itemIndex)}
        primaryColor={primaryColor}
        textColor={textColor}
        textOnPrimary={textOnPrimary}
        onClearOverride={overrideContext.clearOverride}
        onSetOverride={overrideContext.setOverride}
      />
    ) : null}
  </>
);

export default ItemAdvancedSection;
