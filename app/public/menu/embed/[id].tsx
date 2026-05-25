import React, { useCallback, useEffect, useMemo } from 'react';

import { Platform, View } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';

import { useLocalSearchParams } from 'expo-router';


import {
  MenuContentView,
  MenuLoadingState,
} from '../../../../src/components/PublicMenu';
import { WhiteLabelFooter } from '../../../../src/components/PublicMenu/components/WhiteLabelFooter';
import { WhiteLabelHeader } from '../../../../src/components/PublicMenu/components/WhiteLabelHeader';
import { resolvePublicMenuTheme } from '../../../../src/components/PublicMenu/utils/resolvePublicMenuTheme';
import ErrorState from '../../../../src/components/Shared/ErrorState';
import { usePublicWhiteLabelConfig } from '../../../../src/hooks/whiteLabel/hooks/usePublicWhiteLabelConfig';
import { useWhiteLabelRuntime } from '../../../../src/hooks/whiteLabel/hooks/useWhiteLabelRuntime';
import { FM } from '../../../../src/localization/helpers';
import { usePublicBusinessProfile } from '../../../../src/server/customHooks/usePublicBusinessProfile';
import { usePublicMenuGetById } from '../../../../src/server/customHooks/usePublicMenuGetById';
import { sortCategoriesByDisplayOrder, sortMenuItemsByDisplayOrder } from '../../../../src/types/menuTypes';
import { isValueDefined } from '../../../../src/utils/is';
import { logger } from '../../../../src/utils/logger';

import type { Category } from '../../../../src/types/menuTypes';

const POST_MESSAGE_TYPE = 'menu-widget-resize';
const WILDCARD_ORIGIN = '*';

/** Sends the current content height to the parent window for auto-resize. */
function postResizeMessage(height: number, targetOrigin: string): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') return;
  try {
    window.parent.postMessage({ type: POST_MESSAGE_TYPE, height }, targetOrigin);
  } catch (error) {
    logger.warn('EmbedMenuPage', 'Failed to post resize message', error);
  }
}

const EmbedMenuPage = (): React.ReactElement => {
  const params = useLocalSearchParams<{ id: string; origin?: string; theme?: string }>();
  const menuId = String(params.id);
  const targetOrigin = params.origin ?? WILDCARD_ORIGIN;
  const themeOverride = params.theme;
  const menuQuery = usePublicMenuGetById(menuId);
  const tenantId = menuQuery.data?.tenantId ?? null;
  const profileQuery = usePublicBusinessProfile(tenantId);
  const { config: whiteLabelConfig } = usePublicWhiteLabelConfig(tenantId);
  const whiteLabel = useWhiteLabelRuntime(whiteLabelConfig);

  const menuContents = useMemo(() => {
    return menuQuery.data?.contents ?? undefined;
  }, [menuQuery.data]);

  const theme = useMemo(
    () => resolvePublicMenuTheme(menuContents, themeOverride),
    [menuContents, themeOverride],
  );

  useEffect(() => {
    if (menuQuery.isError) {
      const errorValue: unknown = menuQuery.error;
      logger.error('EmbedMenuPage', 'Error loading menu:', errorValue);
    }
  }, [menuQuery.isError, menuQuery.error]);

  const handleLayout = useCallback((event: LayoutChangeEvent) => {
    const { height } = event.nativeEvent.layout;
    postResizeMessage(Math.ceil(height), targetOrigin);
  }, [targetOrigin]);

  if (menuQuery.isLoading)
    return (
      <MenuLoadingState
        backgroundColor={theme.colors.background}
        primaryColor={theme.colors.accent}
      />
    );

  if (menuQuery.isError || !isValueDefined(menuQuery.data))
    return (
      <ErrorState
        message={FM('onlineMenus.errors.loadFailed')}
      />
    );

  const menu = menuQuery.data;
  const menuName = menu.name ?? FM('onlineMenus.title');
  const menuDescription = menu.description ?? '';
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions -- Generated type is compatible at runtime with local Category
  const categories = sortCategoriesByDisplayOrder(menuContents?.categories).map((category) => ({
    ...category,
    items: sortMenuItemsByDisplayOrder(category.items),
  })) as Category[];

  return (
    <View onLayout={handleLayout}>
      <WhiteLabelHeader html={whiteLabel.headerHtml} />
      <MenuContentView
        businessProfile={profileQuery.data}
        categories={categories}
        defaultCategoryLabel={FM('onlineMenus.category')}
        defaultItemLabel={FM('onlineMenus.item')}
        emptyMenuMessage={FM('onlineMenus.messages.emptyMenu')}
        menuDescription={menuDescription}
        menuId={menuId}
        menuName={menuName}
        theme={theme}
      />
      <WhiteLabelFooter html={whiteLabel.footerHtml} />
    </View>
  );
};

export default EmbedMenuPage;
