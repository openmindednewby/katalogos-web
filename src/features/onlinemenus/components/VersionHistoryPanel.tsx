/**
 * Panel showing paginated list of menu versions.
 * Displayed as a tab within the menu editor.
 */
import React, { useCallback, useState } from 'react';

import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FD, FM } from '@/localization/helpers';
import { useMenuVersions } from '@/server/customHooks/useMenuVersions';
import { TestIds } from '@/shared/testIds';
import { isValueDefined } from '@/utils/is';

import VersionDetailView from './VersionDetailView';
import {
  CONTAINER_PADDING, TITLE_FONT_SIZE, TITLE_MARGIN_BOTTOM,
  VERSION_NUMBER_FONT_SIZE, VERSION_DATE_FONT_SIZE, VERSION_DATE_MARGIN_TOP,
  BADGE_PADDING_H, BADGE_PADDING_V, BADGE_RADIUS, BADGE_FONT_SIZE, BADGE_FONT_WEIGHT,
  VERSION_ROW_PADDING, BUTTON_RADIUS,
  LOAD_MORE_MARGIN_TOP, LOAD_MORE_PADDING_V, LOAD_MORE_PADDING_H,
  EMPTY_TEXT_MARGIN_TOP, EMPTY_TEXT_FONT_SIZE,
} from './versioningConstants';

import type { MenuVersionListDto } from '../types';

const DEFAULT_PAGE_SIZE = 10;

const styles = StyleSheet.create({
  container: { flex: 1, padding: CONTAINER_PADDING },
  title: { fontSize: TITLE_FONT_SIZE, fontWeight: 'bold', marginBottom: TITLE_MARGIN_BOTTOM },
  versionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: VERSION_ROW_PADDING, borderBottomWidth: 1 },
  versionInfo: { flex: 1 },
  versionNumber: { fontSize: VERSION_NUMBER_FONT_SIZE, fontWeight: '600' },
  versionDate: { fontSize: VERSION_DATE_FONT_SIZE, marginTop: VERSION_DATE_MARGIN_TOP },
  badge: { paddingHorizontal: BADGE_PADDING_H, paddingVertical: BADGE_PADDING_V, borderRadius: BADGE_RADIUS },
  badgeText: { fontSize: BADGE_FONT_SIZE, fontWeight: BADGE_FONT_WEIGHT },
  loadMoreButton: { alignSelf: 'center', marginTop: LOAD_MORE_MARGIN_TOP, paddingVertical: LOAD_MORE_PADDING_V, paddingHorizontal: LOAD_MORE_PADDING_H, borderRadius: BUTTON_RADIUS },
  emptyText: { textAlign: 'center', marginTop: EMPTY_TEXT_MARGIN_TOP, fontSize: EMPTY_TEXT_FONT_SIZE },
});

interface Props {
  menuId: string;
  textColor: string;
  borderColor: string;
  primaryColor: string;
  backgroundColor: string;
  onMenuRestored: () => void;
}

const VersionHistoryPanel: React.FC<Props> = ({ menuId, textColor, borderColor, primaryColor, backgroundColor, onMenuRestored }) => {
  const [page, setPage] = useState(1);
  const [selectedVersion, setSelectedVersion] = useState<MenuVersionListDto | null>(null);
  const { data, isLoading } = useMenuVersions(menuId, page, DEFAULT_PAGE_SIZE);

  const handleSelectVersion = useCallback((version: MenuVersionListDto) => {
    setSelectedVersion(version);
  }, []);

  const handleBackToList = useCallback(() => {
    setSelectedVersion(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  if (isValueDefined(selectedVersion))
    return (
      <VersionDetailView
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        menuId={menuId}
        primaryColor={primaryColor}
        textColor={textColor}
        version={selectedVersion}
        onBack={handleBackToList}
        onMenuRestored={onMenuRestored}
      />
    );

  const hasMore = isValueDefined(data) && data.page < data.totalPages;

  return (
    <View style={styles.container} testID={TestIds.VERSION_HISTORY_PANEL}>
      <Text style={[styles.title, { color: textColor }]}>{FM('onlineMenus.versioning.panelTitle')}</Text>

      {isLoading ? <ActivityIndicator testID={TestIds.VERSION_HISTORY_LOADING} /> : null}

      {!isLoading && (!isValueDefined(data) || data.items.length === 0) && (
        <Text style={[styles.emptyText, { color: textColor }]} testID={TestIds.VERSION_HISTORY_EMPTY}>
          {FM('onlineMenus.versioning.empty')}
        </Text>
      )}

      {data?.items.map((version) => (
        <TouchableOpacity
          key={version.externalId}
          accessibilityHint={FM('onlineMenus.versioning.tabHint')}
          accessibilityLabel={FM('onlineMenus.versioning.versionLabel', String(version.versionNumber))}
          accessibilityRole="button"
          style={[styles.versionRow, { borderBottomColor: borderColor }]}
          testID={TestIds.VERSION_LIST_ITEM}
          onPress={() => { handleSelectVersion(version); }}
        >
          <View style={styles.versionInfo}>
            <Text style={[styles.versionNumber, { color: textColor }]}>
              {FM('onlineMenus.versioning.versionLabel', String(version.versionNumber))}
            </Text>
            <Text style={[styles.versionDate, { color: textColor }]}>
              {FD(new Date(version.createdDate))}
            </Text>
          </View>
          {version.isCurrent ? <View style={[styles.badge, { backgroundColor: primaryColor }]} testID={TestIds.VERSION_CURRENT_BADGE}>
              <Text style={[styles.badgeText, { color: backgroundColor }]}>
                {FM('onlineMenus.versioning.currentBadge')}
              </Text>
            </View> : null}
        </TouchableOpacity>
      ))}

      {hasMore ? <TouchableOpacity
          accessibilityHint={FM('onlineMenus.versioning.loadMoreHint')}
          accessibilityLabel={FM('onlineMenus.versioning.loadMore')}
          accessibilityRole="button"
          style={[styles.loadMoreButton, { backgroundColor: primaryColor }]}
          testID={TestIds.VERSION_LOAD_MORE_BUTTON}
          onPress={handleLoadMore}
        >
          <Text style={[styles.badgeText, { color: backgroundColor }]}>
            {FM('onlineMenus.versioning.loadMore')}
          </Text>
        </TouchableOpacity> : null}
    </View>
  );
};

export default VersionHistoryPanel;
