/** Full public menu renderer with theme-based styling and responsive layout. */
import React, { useCallback, useMemo } from 'react';

import { ScrollView, Text, View } from 'react-native';

import { FM } from '@/localization/helpers';

import { BusinessInfoSection } from './BusinessInfoSection';
import { ItemDetailModal } from './ItemDetailModal';
import { MenuContentBody } from './MenuContentBody';
import { MenuHeaderControls } from './MenuHeaderControls';
import ScheduleIndicator from './ScheduleIndicator';
import { ShareButton } from './ShareButton';
import { useAnalytics } from '../../../lib/analytics';
import { TestIds } from '../../../shared/testIds';
import { isValueDefined } from '../../../utils/is';
import { useCookieConsent } from "../../CookieConsent/hooks/useCookieConsent";
import { useItemDetailModal } from '../hooks/useItemDetailModal';
import { useItemVisibilityTracker } from '../hooks/useItemVisibilityTracker';
import { useMenuFilter } from '../hooks/useMenuFilter';
import {
  FLEX_ONE_STYLE, HEADER_ROW_STYLE,
  SHARE_SUCCESS_FEEDBACK, TEXT_ON_PRIMARY_BUTTON,
  buildContainerStyle, buildDescriptionStyle,
  buildHeaderStyle, buildInnerWrapper, buildTitleStyle,
} from '../utils/menuContentViewStyles';
import { DEFAULT_PUBLIC_MENU_THEME } from '../utils/publicMenuThemePresets';
import { buildResponsiveLayout, getWindowWidth } from '../utils/responsiveStyles';

import type { DietaryTagDto } from '../../../lib/hooks/dietaryTag/types';
import type { Category, MenuItem, MenuContents, MenuSchedule } from '../../../types/menuTypes';
import type { PublicMenuLocation } from '../hooks/usePublicMenuLocation';
import type { BusinessProfileData } from '../utils/businessProfileSchema';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';

interface MenuContentViewProps {
  menuName: string;
  menuDescription: string;
  categories: Category[];
  emptyMenuMessage: string;
  defaultCategoryLabel: string;
  defaultItemLabel: string;
  menuId?: string;
  theme?: PublicMenuTheme;
  menuUrl?: string;
  businessProfile?: BusinessProfileData;
  menuContents?: MenuContents;
  dietaryTags?: DietaryTagDto[];
  availableLanguages?: Array<{ code: string; name: string }>;
  currentLanguage?: string;
  onLanguageChange?: (code: string) => void;
  schedule?: MenuSchedule | null;
  locations?: PublicMenuLocation[];
  selectedLocationId?: string;
  onLocationChange?: (locationId: string) => void;
  onItemClick?: (item: MenuItem) => void;
}

export const MenuContentView: React.FC<MenuContentViewProps> = ({
  menuName, menuDescription, categories, emptyMenuMessage,
  defaultCategoryLabel, defaultItemLabel, menuId, theme: themeProp,
  menuUrl, businessProfile, menuContents, dietaryTags,
  availableLanguages, currentLanguage, onLanguageChange,
  schedule, locations, selectedLocationId, onLocationChange, onItemClick,
}) => {
  const theme = isValueDefined(themeProp) ? themeProp : DEFAULT_PUBLIC_MENU_THEME;
  const { track } = useAnalytics();
  const { consent } = useCookieConsent();
  const hasConsent = consent?.analytics === true;
  const trackerCallbacks = useMemo(() => ({ track, hasConsent }), [track, hasConsent]);
   
  const { observeItem, trackItemClick } = useItemVisibilityTracker(trackerCallbacks);

  const width = getWindowWidth();
  const responsive = useMemo(() => buildResponsiveLayout(theme.spacing, width), [theme.spacing, width]);
  const innerWrapper = useMemo(() => buildInnerWrapper(responsive), [responsive]);
  const titleStyle = buildTitleStyle(theme, responsive);
  const descriptionStyle = buildDescriptionStyle(theme, responsive);
  const hasShareUrl = isValueDefined(menuUrl);
  const hasLanguageSwitcher = isValueDefined(availableLanguages) && availableLanguages.length > 0 && isValueDefined(onLanguageChange);
  const hasLocationPicker = isValueDefined(locations) && locations.length > 1 && isValueDefined(onLocationChange);

  const {
    searchQuery, setSearchQuery, selectedTags, toggleTag,
    hasActiveFilters, clearAllFilters, filteredCategories, availableTags, filteredItemCount,
  } = useMenuFilter(categories);

  const { selectedItem, isOpen, openModal, closeModal } = useItemDetailModal();

  const handleItemPress = useCallback((item: MenuItem): void => {
    openModal(item);
    onItemClick?.(item);
    const itemId = String(item.id ?? '');
    if (isValueDefined(menuId) && itemId !== '')
      trackItemClick({ itemId, menuId, categoryName: '' });
  }, [openModal, onItemClick, menuId, trackItemClick]);

  const filterAnnouncement = useMemo(() => {
    if (!hasActiveFilters) return FM('accessibility.allItemsShown');
    if (filteredItemCount === 0) return FM('accessibility.noFilterResults');
    return FM('accessibility.filterResultsAnnouncement', String(filteredItemCount));
  }, [hasActiveFilters, filteredItemCount]);

  return (
    <View style={buildContainerStyle(theme)}>
      <ScrollView testID={TestIds.PUBLIC_MENU_VIEWER}>
        <View style={innerWrapper}>
          <View style={buildHeaderStyle(theme, responsive)}>
            <View style={HEADER_ROW_STYLE}>
              <Text accessibilityRole="header" style={[titleStyle, FLEX_ONE_STYLE]}>{menuName}</Text>
              <MenuHeaderControls
                availableLanguages={availableLanguages}
                currentLanguage={currentLanguage}
                hasLanguageSwitcher={hasLanguageSwitcher}
                hasLocationPicker={hasLocationPicker}
                locations={locations}
                selectedLocationId={selectedLocationId}
                theme={theme}
                onLanguageChange={onLanguageChange}
                onLocationChange={onLocationChange}
              />
            </View>
            {menuDescription !== '' ? (
              <Text style={descriptionStyle}>{menuDescription}</Text>
            ) : null}
            <ScheduleIndicator schedule={schedule} textColor={theme.colors.textSecondary} />
          </View>

          <MenuContentBody
            availableTags={availableTags}
            categories={categories}
            clearAllFilters={clearAllFilters}
            defaultCategoryLabel={defaultCategoryLabel}
            defaultItemLabel={defaultItemLabel}
            emptyMenuMessage={emptyMenuMessage}
            filterAnnouncement={filterAnnouncement}
            filteredCategories={filteredCategories}
            hasActiveFilters={hasActiveFilters}
            menuContents={menuContents}
            menuId={menuId}
            observeItem={observeItem}
            openModal={handleItemPress}
            responsive={responsive}
            searchQuery={searchQuery}
            selectedTags={selectedTags}
            setSearchQuery={setSearchQuery}
            theme={theme}
            toggleTag={toggleTag}
          />

          {isValueDefined(businessProfile) ? (
            <BusinessInfoSection
              borderColor={theme.colors.divider}
              profile={businessProfile}
              secondaryColor={theme.colors.textSecondary}
              textColor={theme.colors.text}
            />
          ) : null}
        </View>
      </ScrollView>

      {hasShareUrl ? (
        <ShareButton
          menuName={menuName}
          menuUrl={menuUrl}
          primaryColor={theme.colors.accent}
          successColor={SHARE_SUCCESS_FEEDBACK}
          surfaceColor={theme.colors.surface}
          surfaceTextColor={theme.colors.text}
          textOnPrimary={TEXT_ON_PRIMARY_BUTTON}
        />
      ) : null}

      {isOpen && isValueDefined(selectedItem) ? (
        <ItemDetailModal
          dietaryTags={dietaryTags}
          item={selectedItem}
          responsive={responsive}
          theme={theme}
          onClose={closeModal}
        />
      ) : null}
    </View>
  );
};
