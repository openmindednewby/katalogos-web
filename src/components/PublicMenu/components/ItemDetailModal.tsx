/**
 * ItemDetailModal - Full-screen (mobile) or centered (desktop) modal
 * showing complete menu item details including image, price,
 * description, dietary tags, variants, modifiers, and staff pick info.
 *
 * WCAG: Focus is trapped inside the modal, Escape closes it,
 * and focus returns to the trigger element on close.
 */
import React, { useMemo, useRef } from 'react';

import { ScrollView, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { ModifiersSection, VariantsSection } from './ItemDetailSections';
import { NutritionLabel } from './NutritionLabel';
import { useEscapeKey } from '../../../hooks/useEscapeKey';
import { useFocusTrap } from '../../../hooks/useFocusTrap';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { hasNutritionData } from '../../../utils/nutritionUtils';
import { ContentImage } from '../../Content';
import { DietaryTagBadge } from '../../OnlineMenus/DietaryTags';
import {
  IMAGE_BORDER_RADIUS,
  IMAGE_HEIGHT,
  IMAGE_MARGIN_BOTTOM,
  PRICE_DECIMALS,
  buildBackdropStyle,
  buildCloseButtonStyle,
  buildCloseButtonTextStyle,
  buildDescriptionStyle,
  buildModalContainerStyle,
  buildNameStyle,
  buildPriceStyle,
  buildScrollContentStyle,
  buildStaffBadgeStyle,
  buildStaffBadgeTextStyle,
  buildStaffNoteStyle,
  buildStaffNoteTextStyle,
  buildTagContainerStyle,
} from '../utils/itemDetailModalStyles';

import type { DietaryTagDto } from '../../../lib/hooks/dietaryTag/types';
import type { MenuItem } from '../../../types/menuTypes';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';
import type { ResponsiveLayout } from '../utils/responsiveStyles';

interface ItemDetailModalProps {
  item: MenuItem;
  theme: PublicMenuTheme;
  responsive: ResponsiveLayout;
  dietaryTags?: DietaryTagDto[];
  onClose: () => void;
}

interface ItemDetailScrollContentProps {
  item: MenuItem;
  theme: PublicMenuTheme;
  responsive: ResponsiveLayout;
  matchedTags: DietaryTagDto[];
  itemName: string;
  priceText: string;
  hasVariants: boolean;
  hasModifiers: boolean;
  isFeatured: boolean;
  hasStaffNote: boolean;
  staffNote: string | undefined;
  hasNutrition: boolean;
}

const ItemDetailScrollContent: React.FC<ItemDetailScrollContentProps> = ({
  item,
  theme,
  responsive,
  matchedTags,
  itemName,
  priceText,
  hasVariants,
  hasModifiers,
  isFeatured,
  hasStaffNote,
  staffNote,
  hasNutrition,
}) => {
  const imageStyle = { marginBottom: IMAGE_MARGIN_BOTTOM, borderRadius: IMAGE_BORDER_RADIUS };
  const descriptionText =
    isValueDefined(item.description) && item.description !== ''
      ? String(item.description)
      : FM('publicMenu.itemDetail.noDescription');

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={buildScrollContentStyle(responsive)}>
        <ContentImage
          isPublic
          accessibilityHint={FM('publicMenu.itemDetail.imageHint', itemName)}
          accessibilityLabel={FM('publicMenu.itemDetail.imageAlt', itemName)}
          contentId={item.imageContentId}
          height={IMAGE_HEIGHT}
          style={imageStyle}
          testID={TestIds.ITEM_DETAIL_IMAGE}
        />

        {isFeatured ? (
          <View style={buildStaffBadgeStyle(theme)} testID={TestIds.ITEM_DETAIL_STAFF_PICK_BADGE}>
            <Text style={buildStaffBadgeTextStyle(theme)}>
              {FM('publicMenu.itemDetail.staffPickBadge')}
            </Text>
          </View>
        ) : null}

        <Text accessibilityRole="header" style={buildNameStyle(theme, responsive)} testID={TestIds.ITEM_DETAIL_NAME}>
          {itemName}
        </Text>

        <Text style={buildPriceStyle(theme, responsive)} testID={TestIds.ITEM_DETAIL_PRICE}>
          {priceText}
        </Text>

        {matchedTags.length > 0 ? (
          <View accessibilityRole="list" style={buildTagContainerStyle()} testID={TestIds.ITEM_DETAIL_DIETARY_TAGS}>
            {matchedTags.map((tag) => (
              <DietaryTagBadge key={tag.key} tag={tag} testID={TestIds.DIETARY_TAG_BADGE} />
            ))}
          </View>
        ) : null}

        <Text style={buildDescriptionStyle(theme, responsive)} testID={TestIds.ITEM_DETAIL_DESCRIPTION}>
          {descriptionText}
        </Text>

        {hasStaffNote ? (
          <View style={buildStaffNoteStyle(theme)} testID={TestIds.ITEM_DETAIL_STAFF_NOTE}>
            <Text style={buildStaffNoteTextStyle(theme, responsive)}>
              {FM('publicMenu.itemDetail.staffNoteQuoted', String(staffNote))}
            </Text>
          </View>
        ) : null}

        {hasNutrition && isValueDefined(item.nutritionalInfo) ? (
          <NutritionLabel info={item.nutritionalInfo} responsive={responsive} theme={theme} />
        ) : null}

        {hasVariants ? <VariantsSection item={item} responsive={responsive} theme={theme} /> : null}
        {hasModifiers ? <ModifiersSection item={item} responsive={responsive} theme={theme} /> : null}
      </View>
    </ScrollView>
  );
};

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({
  item,
  theme,
  responsive,
  dietaryTags,
  onClose,
}) => {
  const modalRef = useRef<View>(null);

  useEscapeKey(onClose);
  useFocusTrap(modalRef, true);

  const itemName = item.name ?? '';
  const itemPrice = item.price ?? 0;
  const hasVariants = isValueDefined(item.variantGroups) && item.variantGroups.length > 0;
  const hasModifiers = isValueDefined(item.modifierGroups) && item.modifierGroups.length > 0;
  const isFeatured = item.isFeatured === true;
  const staffNote = item.staffNote;
  const hasStaffNote = isFeatured && isValueDefined(staffNote) && staffNote !== '';
  const hasNutrition = hasNutritionData(item.nutritionalInfo);
  const matchedTags = useMemo(() => {
    const tags = item.tags ?? [];
    if (!isValueDefined(dietaryTags) || tags.length === 0) return [];
    return dietaryTags.filter((tag) => tags.includes(tag.key));
  }, [dietaryTags, item.tags]);

  const priceText = hasVariants
    ? FM('publicMenu.itemDetail.fromPrice', `$${itemPrice.toFixed(PRICE_DECIMALS)}`)
    : `$${itemPrice.toFixed(PRICE_DECIMALS)}`;

  return (
    <View style={buildBackdropStyle()} testID={TestIds.ITEM_DETAIL_MODAL}>
      <TouchableOpacity
        accessibilityHint={FM('publicMenu.itemDetail.backdropHint')}
        accessibilityLabel={FM('publicMenu.itemDetail.backdropLabel')}
        activeOpacity={1}
        style={buildBackdropStyle()}
        testID={TestIds.ITEM_DETAIL_BACKDROP}
        onPress={onClose}
      />
      <View
        ref={modalRef}
        accessibilityViewIsModal
        aria-modal
        accessibilityRole="none"
        style={buildModalContainerStyle(theme, responsive)}
      >
        <TouchableOpacity
          accessibilityHint={FM('publicMenu.itemDetail.closeButtonHint')}
          accessibilityLabel={FM('publicMenu.itemDetail.closeButtonLabel')}
          accessibilityRole="button"
          style={buildCloseButtonStyle(theme, responsive)}
          testID={TestIds.ITEM_DETAIL_CLOSE_BUTTON}
          onPress={onClose}
        >
          <Text style={buildCloseButtonTextStyle(theme)}>{'\u2715'}</Text>
        </TouchableOpacity>

        <ItemDetailScrollContent
          hasModifiers={hasModifiers}
          hasNutrition={hasNutrition}
          hasStaffNote={hasStaffNote}
          hasVariants={hasVariants}
          isFeatured={isFeatured}
          item={item}
          itemName={itemName}
          matchedTags={matchedTags}
          priceText={priceText}
          responsive={responsive}
          staffNote={staffNote ?? undefined}
          theme={theme}
        />
      </View>
    </View>
  );
};
