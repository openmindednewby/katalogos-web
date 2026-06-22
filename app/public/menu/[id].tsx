import React, { useEffect, useMemo, useRef } from 'react';

import { useLocalSearchParams } from 'expo-router';

import {
  MenuLoadingState,
} from '../../../src/components/PublicMenu';
import { MenuDisplayView } from '../../../src/components/PublicMenu/components/MenuDisplayView';
import { usePublicMenuLanguage } from '../../../src/components/PublicMenu/hooks/usePublicMenuLanguage';
import { usePublicMenuLocation } from '../../../src/components/PublicMenu/hooks/usePublicMenuLocation';
import { resolvePublicMenuTheme } from '../../../src/components/PublicMenu/utils/resolvePublicMenuTheme';
import ErrorState from '../../../src/components/Shared/ErrorState';
import { useOnlineStatus } from '../../../src/hooks/useOnlineStatus';
import { usePublicWhiteLabelConfig } from '../../../src/hooks/whiteLabel/hooks/usePublicWhiteLabelConfig';
import { useWhiteLabelRuntime } from '../../../src/hooks/whiteLabel/hooks/useWhiteLabelRuntime';
import { useAnalytics } from '../../../src/lib/analytics';
import { useGetPublicDietaryTags } from '../../../src/lib/hooks/dietaryTag';
import { notify } from '../../../src/lib/notifications';
import { FM } from '../../../src/localization/helpers';
import { usePublicBusinessProfile } from '../../../src/server/customHooks/usePublicBusinessProfile';
import { usePublicMenuGetById } from '../../../src/server/customHooks/usePublicMenuGetById';
import AnalyticsEventName from '../../../src/shared/enums/AnalyticsEventName';
import { getErrorMessage } from '../../../src/utils/errorMessage';
import { isValueDefined } from '../../../src/utils/is';
import { logger } from '../../../src/utils/logger';

import type { PublicMenuLocation } from '../../../src/components/PublicMenu/hooks/usePublicMenuLocation';
import type { MenuSchedule, MenuContents as LocalMenuContents } from '../../../src/types/menuTypes';

const PublicMenuViewerPage = (): React.ReactElement => {
  const params = useLocalSearchParams<{ id: string; theme?: string }>();
  const menuId = String(params.id);
  const themeOverride = params.theme;
  const { isOffline } = useOnlineStatus();

  const menuQuery = usePublicMenuGetById(menuId);
  const availableLanguages = useMemo(
    () => menuQuery.data?.availableLanguages ?? [],
    [menuQuery.data?.availableLanguages],
  );

  // Extract locations from the API response (field added after Orval generation)
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Runtime field not yet in generated types
  const menuDataRecord = menuQuery.data as Record<string, unknown> | undefined;
  const availableLocations = useMemo(
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Runtime field not yet in generated types
    () => (menuDataRecord?.locations as PublicMenuLocation[] | undefined) ?? [],
    [menuDataRecord],
  );

  const { currentLanguage, setLanguage, isRtl } = usePublicMenuLanguage(availableLanguages);
  const { selectedLocationId, setLocation } = usePublicMenuLocation(availableLocations);
  const translatedQuery = usePublicMenuGetById(menuId, currentLanguage, selectedLocationId);
  const activeQuery = currentLanguage !== '' || selectedLocationId !== '' ? translatedQuery : menuQuery;

  // Extract schedule from API response (field added after Orval generation)
  const menuSchedule = useMemo(
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Runtime field not yet in generated types
    () => (activeQuery.data as Record<string, unknown> | undefined)?.schedule as MenuSchedule | null | undefined,
    [activeQuery.data],
  );

  const tenantId = activeQuery.data?.tenantId ?? null;
  const profileQuery = usePublicBusinessProfile(tenantId);
  const dietaryTagsQuery = useGetPublicDietaryTags();
  const { config: whiteLabelConfig } = usePublicWhiteLabelConfig(tenantId);
  const whiteLabel = useWhiteLabelRuntime(whiteLabelConfig);
  const { track } = useAnalytics();
  const hasTrackedViewRef = useRef(false);

  // Trust boundary: the local domain MenuContents refines the loose wire types (e.g. the API's
  // `position?: string | null` becomes the MediaPosition enum). The cast asserts that API data
  // conforms to those refinements; replacing it requires a runtime validation layer (see the
  // tsc-zero task doc, follow-up 2).
  const menuContents = useMemo(
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- documented domain trust boundary (wire types -> refined domain types)
    () => (activeQuery.data?.contents ?? undefined) as unknown as LocalMenuContents | undefined,
    [activeQuery.data],
  );

  const theme = useMemo(
    () => resolvePublicMenuTheme(menuContents, themeOverride),
    [menuContents, themeOverride],
  );

  useEffect(() => {
    if (!activeQuery.isError) return;
    const errorValue: unknown = activeQuery.error;
    const errorMsg = getErrorMessage(errorValue, 'Error loading menu');
    logger.error('PublicMenuViewerPage', 'Error loading menu:', errorValue);
    notify('error', errorMsg);
  }, [activeQuery.isError, activeQuery.error]);

  useEffect(() => {
    if (!activeQuery.isSuccess || hasTrackedViewRef.current) return;
    hasTrackedViewRef.current = true;
    track(AnalyticsEventName.MenuViewedPublic, {
      menuId,
      language: currentLanguage === '' ? 'default' : currentLanguage,
      ...(isValueDefined(tenantId) ? { tenantId } : {}),
    });
  }, [activeQuery.isSuccess, menuId, currentLanguage, tenantId, track]);

  if (activeQuery.isLoading)
    return (
      <MenuLoadingState
        backgroundColor={theme.colors.background}
        primaryColor={theme.colors.accent}
      />
    );

  if (activeQuery.isError || !isValueDefined(activeQuery.data))
    return <ErrorState message={FM('onlineMenus.errors.loadFailed')} />;

  const hasActiveOverrides = currentLanguage !== '' || selectedLocationId !== '';
  const isTranslationLoading = translatedQuery.isFetching && hasActiveOverrides;

  return (
    <MenuDisplayView
      availableLanguages={availableLanguages}
      currentLanguage={currentLanguage}
      dietaryTags={dietaryTagsQuery.data}
      isOffline={isOffline}
      isRtl={isRtl}
      isTranslationLoading={isTranslationLoading}
      locations={availableLocations}
      menu={activeQuery.data}
      menuContents={menuContents}
      menuId={menuId}
      profileData={profileQuery.data}
      schedule={menuSchedule}
      selectedLocationId={selectedLocationId}
      theme={theme}
      whiteLabel={whiteLabel}
      onLanguageChange={setLanguage}
      onLocationChange={setLocation}
    />
  );
};

export default PublicMenuViewerPage;
