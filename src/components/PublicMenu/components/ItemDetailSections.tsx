/**
 * Sub-sections for ItemDetailModal: Variants and Modifiers display.
 * Extracted to keep the main modal component under 200 lines.
 */
import React from 'react';

import { Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import {
  PRICE_DECIMALS,
  buildGroupContainerStyle,
  buildGroupHeaderStyle,
  buildGroupSubtitleStyle,
  buildOptionNameStyle,
  buildOptionPriceStyle,
  buildOptionRowStyle,
  buildSectionTitleStyle,
} from '../utils/itemDetailModalStyles';

import type { MenuItem } from '../../../types/menuTypes';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';
import type { ResponsiveLayout } from '../utils/responsiveStyles';

interface SectionProps {
  item: MenuItem;
  theme: PublicMenuTheme;
  responsive: ResponsiveLayout;
}

function buildSelectionSubtitle(
  min?: number,
  max?: number | null,
): string {
  const hasMin = isValueDefined(min) && min > 0;
  const hasMax = isValueDefined(max) && max > 0;

  if (hasMin && hasMax)
    return FM('publicMenu.itemDetail.selectionsRange', String(min), String(max));

  if (hasMin)
    return FM('publicMenu.itemDetail.selectionsMin', String(min));

  if (hasMax)
    return FM('publicMenu.itemDetail.selectionsMax', String(max));

  return '';
}

export const VariantsSection: React.FC<SectionProps> = ({ item, theme, responsive }) => {
  const groups = item.variantGroups ?? [];
  if (groups.length === 0) return null;

  return (
    <View>
      <Text style={buildSectionTitleStyle(theme, responsive)}>
        {FM('publicMenu.itemDetail.variantsHeading')}
      </Text>
      {groups.map((group, gIndex) => {
        const groupKey = `vg-${String(gIndex)}`;
        const isRequired = group.isRequired === true;
        const variants = group.variants ?? [];
        return (
          <View
            key={groupKey}
            style={buildGroupContainerStyle()}
            testID={`${TestIds.ITEM_DETAIL_VARIANT_GROUP}-${String(gIndex)}`}
          >
            <Text style={buildGroupHeaderStyle(theme, responsive)}>
              {isRequired
                ? FM('publicMenu.itemDetail.groupNameRequired', group.name)
                : FM('publicMenu.itemDetail.groupNameOptional', group.name)}
            </Text>
            {variants.map((variant, vIndex) => {
              const variantKey = `v-${String(gIndex)}-${String(vIndex)}`;
              const isUnavailable = variant.isAvailable === false;
              return (
                <View key={variantKey} style={buildOptionRowStyle()}>
                  <Text style={buildOptionNameStyle(theme, responsive, isUnavailable)}>
                    {variant.name}
                    {isUnavailable ? ` (${FM('publicMenu.itemDetail.unavailableLabel')})` : ''}
                  </Text>
                  <Text style={buildOptionPriceStyle(theme, responsive)}>
                    {FM('publicMenu.itemDetail.variantPriceFormat', variant.price.toFixed(PRICE_DECIMALS))}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};

export const ModifiersSection: React.FC<SectionProps> = ({ item, theme, responsive }) => {
  const groups = item.modifierGroups ?? [];
  if (groups.length === 0) return null;

  return (
    <View>
      <Text style={buildSectionTitleStyle(theme, responsive)}>
        {FM('publicMenu.itemDetail.modifiersHeading')}
      </Text>
      {groups.map((group, gIndex) => {
        const groupKey = `mg-${String(gIndex)}`;
        const isRequired = group.isRequired === true;
        const modifiers = group.modifiers ?? [];
        const subtitle = buildSelectionSubtitle(group.minSelections, group.maxSelections);
        return (
          <View
            key={groupKey}
            style={buildGroupContainerStyle()}
            testID={`${TestIds.ITEM_DETAIL_MODIFIER_GROUP}-${String(gIndex)}`}
          >
            <Text style={buildGroupHeaderStyle(theme, responsive)}>
              {isRequired
                ? FM('publicMenu.itemDetail.groupNameRequired', group.name)
                : FM('publicMenu.itemDetail.groupNameOptional', group.name)}
            </Text>
            {subtitle !== '' ? (
              <Text style={buildGroupSubtitleStyle(theme, responsive)}>
                {subtitle}
              </Text>
            ) : null}
            {modifiers.map((modifier, mIndex) => {
              const modifierKey = `m-${String(gIndex)}-${String(mIndex)}`;
              const isUnavailable = modifier.isAvailable === false;
              return (
                <View key={modifierKey} style={buildOptionRowStyle()}>
                  <Text style={buildOptionNameStyle(theme, responsive, isUnavailable)}>
                    {modifier.name}
                    {isUnavailable ? ` (${FM('publicMenu.itemDetail.unavailableLabel')})` : ''}
                  </Text>
                  <Text style={buildOptionPriceStyle(theme, responsive)}>
                    {FM('publicMenu.itemDetail.modifierPriceFormat', modifier.priceAdjustment.toFixed(PRICE_DECIMALS))}
                  </Text>
                </View>
              );
            })}
          </View>
        );
      })}
    </View>
  );
};
