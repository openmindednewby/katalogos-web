import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useSelector } from 'react-redux';

import { EmbedWidgetModal } from '../../../src/components/OnlineMenus/EmbedWidget';
import { isMenuListData, toPreviewItem } from '../../../src/components/OnlineMenus/menuPageUtils';
import { MenuPreviewModal } from '../../../src/components/OnlineMenus/MenuPreviewModal';
import { MenuTabBar } from '../../../src/components/OnlineMenus/MenuTabBar';
import { QrCodeModal } from '../../../src/components/OnlineMenus/QrCode';
import EmptyListState from '../../../src/components/Shared/EmptyListState';
import PageHeaderWithActions from '../../../src/components/Shared/PageHeaderWithActions';
import TenantListItem from '../../../src/components/Tenants/TenantListItem';
import FullMenuEditor from '../../../src/features/onlinemenus/components/FullMenuEditor';
import { useTooltipTourContext } from '../../../src/features/tooltipTour/components/TooltipProvider';
import { useMenuEmbed } from '../../../src/hooks/useMenuEmbed';
import {
  useMenuQueries,
  useMenuDelete,
  useMenuActivateToggle,
  useMenuSave,
  useMenuOpenExternal,
} from '../../../src/hooks/useMenuPageHandlers';
import { useMenuQrCode } from '../../../src/hooks/useMenuQrCode';
import { useAnalytics } from '../../../src/lib/analytics';
import { notify } from '../../../src/lib/notifications';
import { useSubscription } from '../../../src/lib/subscription/hooks/useSubscription';
import { FM } from '../../../src/localization/helpers';
import MenuTabFilter from '../../../src/shared/enums/MenuTabFilter';
import ThemeMode from '../../../src/shared/enums/ThemeMode';
import TooltipTourId from '../../../src/shared/enums/TooltipTourId';
import { TestIds } from '../../../src/shared/testIds';
import { layoutStyles, themePalette } from '../../../src/theme/utils/styles';
import { isValueDefined } from '../../../src/utils/is';

import type { RootState } from '../../../src/store/reduxStore';
import type { TenantMenusDto } from '../../../src/types/menuTypes';

const screenStyles = StyleSheet.create({
  errorContainer: { padding: 12 },
  refreshButtonTouchable: { marginTop: 8 },
  refreshButton: { padding: 8, borderRadius: 6 },
  listContentContainer: { paddingBottom: 16 },
  loadingContainer: { justifyContent: 'center', alignItems: 'center' },
});

const OnlineMenusPage = (): React.ReactElement => {
  const theme = useSelector((s: RootState) => s.ui.theme);
  const colors = theme === ThemeMode.Dark ? themePalette.dark : themePalette.light;
  const queries = useMenuQueries();
  const { listQuery, createMutation, updateMutation, activateMutation, deactivateMutation, refetchMenusSoon } = queries;
  const { limits, isLoading: isSubscriptionLoading, isError: isSubscriptionError } = useSubscription();
  const { track } = useAnalytics();

  const { startTour, hasSeenTour } = useTooltipTourContext();

  // Track the menu being edited by externalId rather than by snapshot. This
  // lets `editingItem` re-derive from the latest `allItems` on every render,
  // so when the list query refetches after a save the open editor sees the
  // fresh contents (categories/items/imageContentIds) instead of holding a
  // stale closure from the moment Edit was clicked.
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<MenuTabFilter>(MenuTabFilter.All);
  const [previewItem, setPreviewItem] = useState<TenantMenusDto | null>(null);
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);

  const allItems = useMemo((): TenantMenusDto[] => {
    const data = isMenuListData(listQuery.data) ? listQuery.data : undefined;
    const source: TenantMenusDto[] = Array.isArray(data?.menus) ? data.menus : [];
    return [...source].sort((a, b) => {
      const aTime = typeof a.createdDate === 'string' ? new Date(a.createdDate).getTime() : 0;
      const bTime = typeof b.createdDate === 'string' ? new Date(b.createdDate).getTime() : 0;
      return bTime - aTime;
    });
  }, [listQuery.data]);

  const items = useMemo(
    () => (activeTab === MenuTabFilter.Active ? allItems.filter((menu) => menu.isActive === true) : allItems),
    [allItems, activeTab],
  );

  const editingItem = useMemo(
    () => (isValueDefined(editingItemId) ? allItems.find((m) => m.externalId === editingItemId) ?? null : null),
    [allItems, editingItemId],
  );

  const handleCloseModal = useCallback(() => { setIsModalVisible(false); setEditingItemId(null); }, []);
  const handleDelete = useMenuDelete(useMemo(() => ({ deleteMutation: queries.deleteMutation, refetchMenusSoon, t: FM, analyticsTrack: track }), [queries.deleteMutation, refetchMenusSoon, track]));
  const handleActivateToggle = useMenuActivateToggle(useMemo(() => ({ activateMutation, deactivateMutation, refetchMenusSoon, t: FM, analyticsTrack: track }), [activateMutation, deactivateMutation, refetchMenusSoon, track]));
  const saveCallbacks = useMemo(() => ({ onCloseModal: handleCloseModal, refetchMenusSoon }), [handleCloseModal, refetchMenusSoon]);
  const handleSave = useMenuSave(useMemo(() => ({ editingItem, createMutation, updateMutation, callbacks: saveCallbacks, t: FM, analyticsTrack: track }), [editingItem, createMutation, updateMutation, saveCallbacks, track]));
  const handleOpenExternal = useMenuOpenExternal(FM);

  useEffect(() => {
    const isReadyForTour = !listQuery.isLoading && allItems.length > 0;
    const shouldStartTour = isReadyForTour && !hasSeenTour(TooltipTourId.PublicMenu);
    if (shouldStartTour)
      startTour(TooltipTourId.PublicMenu);
  }, [listQuery.isLoading, allItems.length, hasSeenTour, startTour]);

  const { qrCodeState, isQrCodeVisible, handleQrCode, handleCloseQrCode } = useMenuQrCode(allItems);
  const { embedState, isEmbedVisible, handleEmbed, handleCloseEmbed } = useMenuEmbed(allItems);
  const handleCreate = useCallback(() => {
    const canEnforceLimit = !isSubscriptionLoading && !isSubscriptionError;
    if (canEnforceLimit && allItems.length >= limits.maxMenus) {
      notify('info', FM('settings.billing.featureGating.menuLimitReached'));
      return;
    }
    setEditingItemId(null);
    setIsModalVisible(true);
  }, [allItems.length, limits.maxMenus, isSubscriptionLoading, isSubscriptionError]);
  const handleEdit = useCallback((item: TenantMenusDto) => { setEditingItemId(item.externalId ?? null); setIsModalVisible(true); }, []);

  const handlePreview = useCallback(
    (externalId: string) => {
      const menuItem = allItems.find((m) => m.externalId === externalId);
      if (isValueDefined(menuItem)) {
        setPreviewItem(menuItem);
        setIsPreviewModalVisible(true);
      }
    },
    [allItems],
  );

  const handleClosePreview = useCallback(() => { setIsPreviewModalVisible(false); setPreviewItem(null); }, []);
  const handleRefresh = useCallback(() => { refetchMenusSoon(); }, [refetchMenusSoon]);

  const renderItem = useCallback(
    ({ item }: { item: TenantMenusDto }) => {
      const itemId = String(item.externalId ?? '');
      return (
        <TenantListItem
          showId
          activateButtonTestID={TestIds.MENU_CARD_ACTIVATE_BUTTON} deactivateButtonTestID={TestIds.MENU_CARD_DEACTIVATE_BUTTON}
          deleteButtonTestID={TestIds.MENU_CARD_DELETE_BUTTON} editButtonTestID={TestIds.MENU_CARD_EDIT_BUTTON}
          embedButtonTestID={TestIds.MENU_CARD_EMBED_BUTTON} idTestID={TestIds.MENU_CARD_ID}
          item={item} nameTestID={TestIds.MENU_CARD_NAME}
          openExternalButtonTestID={TestIds.MENU_CARD_OPEN_EXTERNAL_BUTTON} previewButtonTestID={TestIds.MENU_CARD_PREVIEW_BUTTON}
          qrCodeButtonTestID={TestIds.MENU_CARD_QR_CODE_BUTTON} statusBadgeTestID={TestIds.MENU_CARD_STATUS_BADGE}
          statusKey="isActive" testID={TestIds.MENU_CARD} translationNs="onlineMenus"
          onActivate={handleActivateToggle} onDelete={() => handleDelete(item)} onEdit={() => handleEdit(item)}
          onEmbed={() => handleEmbed(itemId)} onOpenExternal={() => handleOpenExternal(itemId)}
          onPreview={() => handlePreview(itemId)} onQrCode={() => handleQrCode(itemId)}
        />
      );
    },
    [handleEdit, handleDelete, handleActivateToggle, handlePreview, handleOpenExternal, handleQrCode, handleEmbed],
  );

  const pageHeader = (
    <PageHeaderWithActions
      createButtonTestId={TestIds.MENU_LIST_CREATE_BUTTON} refreshButtonTestId={TestIds.MENU_LIST_REFRESH_BUTTON}
      refreshing={listQuery.isFetching} title={FM('onlineMenus.title')}
      onCreatePress={handleCreate} onRefresh={handleRefresh}
    />
  );

  if (listQuery.isLoading)
    return (
      <View style={[layoutStyles.container, { backgroundColor: colors.background }]}>
        {pageHeader}
        <View style={[layoutStyles.container, screenStyles.loadingContainer]}>
          <ActivityIndicator color={colors.primary} size="large" testID={TestIds.LOADING_INDICATOR} />
        </View>
      </View>
    );

  if (listQuery.isError)
    return (
      <View style={[layoutStyles.container, { backgroundColor: colors.background }]}>
        {pageHeader}
        <View style={screenStyles.errorContainer}>
          <Text style={{ color: String(colors.error) }}>{FM('onlineMenus.errors.loadFailed')}</Text>
          <TouchableOpacity accessibilityHint={FM('onlineMenus.errors.retryHint')} accessibilityLabel={FM('common.refresh')} accessibilityRole="button" style={screenStyles.refreshButtonTouchable} testID={TestIds.MENU_LIST_REFRESH_BUTTON} onPress={handleRefresh}>
            <View style={[screenStyles.refreshButton, { backgroundColor: colors.primary }]}>
              <Text style={{ color: String(colors.textOnPrimary) }}>{FM('common.refresh')}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    );

  return (
    <View style={[layoutStyles.container, { backgroundColor: colors.background }]} testID={TestIds.MENU_LIST}>
      {pageHeader}
      <MenuTabBar
        activeTab={activeTab}
        borderColor={String(colors.border)}
        primaryColor={String(colors.primary)}
        t={FM}
        textColor={String(colors.text)}
        onTabChange={setActiveTab}
      />
      <FlatList
        contentContainerStyle={screenStyles.listContentContainer}
        data={items}
        keyExtractor={(item) => String(item.externalId)}
        ListEmptyComponent={<EmptyListState messageKey="dashboard.menus.emptyList" testID={TestIds.EMPTY_LIST_STATE} />}
        renderItem={renderItem}
      />
      <FullMenuEditor isSaving={createMutation.isPending || updateMutation.isPending} item={editingItem} visible={isModalVisible} onCancel={handleCloseModal} onSave={handleSave} />
      <MenuPreviewModal colors={{ surface: colors.surface, border: colors.border, text: colors.text }} item={toPreviewItem(previewItem)} visible={isPreviewModalVisible} onClose={handleClosePreview} />
      <QrCodeModal menuName={qrCodeState?.menuName ?? ''} publicUrl={qrCodeState?.publicUrl ?? ''} visible={isQrCodeVisible} onClose={handleCloseQrCode} />
      <EmbedWidgetModal menuId={embedState?.menuId ?? ''} menuName={embedState?.menuName ?? ''} publicUrl={embedState?.publicUrl ?? ''} visible={isEmbedVisible} onClose={handleCloseEmbed} />
    </View>
  );
};
export default OnlineMenusPage;
