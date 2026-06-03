/** MenuDisplayView - renders the fully-loaded public menu with white-label integration. */
import React, { useMemo } from 'react';

import { ActivityIndicator, View } from 'react-native';

import { MenuContentView } from './MenuContentView';
import OfflineBanner from './OfflineBanner';
import { SeoHead } from './SeoHead';
import { WhiteLabelFooter } from './WhiteLabelFooter';
import { WhiteLabelHeader } from './WhiteLabelHeader';
import env from '../../../config/environment';
import { FM } from '../../../localization/helpers';
import { sortCategoriesByDisplayOrder, sortMenuItemsByDisplayOrder } from '../../../types/menuTypes';
import { getLanguageName } from '../../OnlineMenus/TranslationManager/utils/supportedLanguages';
import FreeTierWatermark from '../../Shared/FreeTierWatermark';

import type { WhiteLabelRuntimeResult } from '../../../hooks/whiteLabel/hooks/useWhiteLabelRuntime';
import type { DietaryTagDto } from '../../../lib/hooks/dietaryTag/types';
import type { Category, MenuContents, MenuSchedule } from '../../../types/menuTypes';
import type { PublicMenuLocation } from '../hooks/usePublicMenuLocation';
import type { BusinessProfileData } from '../utils/businessProfileSchema';
import type { PublicMenuTheme } from '../utils/publicMenuThemeTypes';

/** Subset of PublicMenuDto fields used by the display view. */
interface PublicMenuData {
  name?: string | null;
  description?: string | null;
  showWatermark?: boolean;
}

const MIN_LANGUAGES_FOR_SWITCHER = 2;
const TRANSLATION_OVERLAY_COLOR = 'rgba(0,0,0,0.3)';

const RTL_CONTAINER_STYLE = { flex: 1, direction: 'rtl' as const };
const LTR_CONTAINER_STYLE = { flex: 1, direction: 'ltr' as const };

const TRANSLATION_OVERLAY_STYLE = {
  position: 'absolute' as const,
  top: 0, left: 0, right: 0, bottom: 0,
  justifyContent: 'center' as const,
  alignItems: 'center' as const,
  backgroundColor: TRANSLATION_OVERLAY_COLOR,
};

function buildLanguageOptions(codes: string[]): Array<{ code: string; name: string }> {
  return codes.map((code) => ({ code, name: getLanguageName(code) }));
}

function buildSortedCategories(menuContents: MenuContents | undefined): Category[] {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Generated type compatible at runtime
  return sortCategoriesByDisplayOrder(menuContents?.categories).map((category) => ({
    ...category,
    items: sortMenuItemsByDisplayOrder(category.items),
  })) as Category[];
}

interface MenuDisplayViewProps {
  menu: PublicMenuData;
  menuContents: MenuContents | undefined;
  theme: PublicMenuTheme;
  menuId: string;
  availableLanguages: string[];
  currentLanguage: string;
  isRtl: boolean;
  isOffline: boolean;
  isTranslationLoading: boolean;
  dietaryTags: DietaryTagDto[] | undefined;
  schedule: MenuSchedule | null | undefined;
  profileData: BusinessProfileData | undefined;
  locations: PublicMenuLocation[];
  selectedLocationId: string;
  whiteLabel: WhiteLabelRuntimeResult;
  onLanguageChange: (code: string) => void;
  onLocationChange: (locationId: string) => void;
}

/**
 * API profile fields are `string | null` while SeoHead props want
 * `string | undefined` — module-level so the null-coalescing doesn't count
 * toward the component's complexity budget.
 */
function orUndefined<T>(value: T | null | undefined): T | undefined {
  return value ?? undefined;
}

export const MenuDisplayView: React.FC<MenuDisplayViewProps> = ({
  menu, menuContents, theme, menuId, availableLanguages,
  currentLanguage, isRtl, isOffline, isTranslationLoading,
  dietaryTags, schedule, profileData, locations, selectedLocationId,
  whiteLabel, onLanguageChange, onLocationChange,
}) => {
  const menuName = menu.name ?? FM('onlineMenus.title');
  const menuDescription = menu.description ?? '';
  const categories = useMemo(() => buildSortedCategories(menuContents), [menuContents]);
  const publicUrl = `${env.APP_BASE_URL}/public/menu/${menuId}`;
  const tierWatermark = menu.showWatermark ?? true;
  const shouldShowWatermark = tierWatermark && whiteLabel.showPoweredBy;
  const showLanguageSwitcher = availableLanguages.length >= MIN_LANGUAGES_FOR_SWITCHER;
  const languageOptions = showLanguageSwitcher ? buildLanguageOptions(availableLanguages) : [];

  return (
    <View style={isRtl ? RTL_CONTAINER_STYLE : LTR_CONTAINER_STYLE}>
      <SeoHead
        businessProfile={profileData}
        categories={categories}
        logoUrl={whiteLabel.customLogoUrl ?? orUndefined(profileData?.logoUrl)}
        menuDescription={menuDescription}
        menuName={menuName}
        publicUrl={publicUrl}
        restaurantName={orUndefined(profileData?.name)}
      />
      {isOffline ? (
        <OfflineBanner
          backgroundColor={theme.colors.surface}
          borderColor={theme.colors.accent}
          textColor={theme.colors.text}
        />
      ) : null}
      <WhiteLabelHeader html={whiteLabel.headerHtml} />
      <MenuContentView
        availableLanguages={showLanguageSwitcher ? languageOptions : undefined}
        businessProfile={profileData}
        categories={categories}
        currentLanguage={currentLanguage}
        defaultCategoryLabel={FM('onlineMenus.category')}
        defaultItemLabel={FM('onlineMenus.item')}
        dietaryTags={dietaryTags}
        emptyMenuMessage={FM('onlineMenus.messages.emptyMenu')}
        locations={locations}
        menuContents={menuContents}
        menuDescription={menuDescription}
        menuId={menuId}
        menuName={menuName}
        menuUrl={publicUrl}
        schedule={schedule}
        selectedLocationId={selectedLocationId}
        theme={theme}
        onLanguageChange={onLanguageChange}
        onLocationChange={onLocationChange}
      />
      {isTranslationLoading ? (
        <View style={TRANSLATION_OVERLAY_STYLE}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
        </View>
      ) : null}
      <WhiteLabelFooter html={whiteLabel.footerHtml} />
      {shouldShowWatermark ? <FreeTierWatermark /> : null}
    </View>
  );
};
