import React, { memo, useCallback } from 'react';

import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import type { ItemViewEntry } from '../types';

const TITLE_FONT_SIZE = 16;
const TITLE_MARGIN_BOTTOM = 12;
const ROW_PADDING_VERTICAL = 10;
const ROW_BORDER_BOTTOM_WIDTH = 1;
const ITEM_NAME_FONT_SIZE = 15;
const VIEW_COUNT_FONT_SIZE = 14;
const EMPTY_TEXT_FONT_SIZE = 14;
const EMPTY_PADDING_VERTICAL = 20;

const styles = StyleSheet.create({
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
    marginBottom: TITLE_MARGIN_BOTTOM,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: ROW_PADDING_VERTICAL,
    borderBottomWidth: ROW_BORDER_BOTTOM_WIDTH,
  },
  itemName: {
    fontSize: ITEM_NAME_FONT_SIZE,
    fontWeight: '500',
    flex: 1,
  },
  viewCount: {
    fontSize: VIEW_COUNT_FONT_SIZE,
  },
  emptyText: {
    fontSize: EMPTY_TEXT_FONT_SIZE,
    textAlign: 'center',
    paddingVertical: EMPTY_PADDING_VERTICAL,
  },
});

interface TopItemsListProps {
  items: ItemViewEntry[];
}

const TopItemsList = memo(({
  items,
}: TopItemsListProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  const renderItem = useCallback(({ item }: ListRenderItemInfo<ItemViewEntry>): React.ReactElement => {
    const viewLabel = FM('analytics.detail.viewCount', String(item.viewCount));

    return (
      <View
        accessibilityHint={FM('analytics.detail.topItemHint', viewLabel)}
        accessibilityLabel={FM('analytics.detail.topItemLabel', item.itemName, viewLabel)}
        style={[styles.row, { borderBottomColor: colors.border }]}
        testID={TestIds.MENU_ANALYTICS_TOP_ITEM}
      >
        <Text style={[styles.itemName, { color: colors.text }]}>
          {item.itemName}
        </Text>
        <Text style={[styles.viewCount, { color: colors.textSecondary }]}>
          {viewLabel}
        </Text>
      </View>
    );
  }, [colors]);

  return (
    <View testID={TestIds.MENU_ANALYTICS_TOP_ITEMS_LIST}>
      <Text style={[styles.title, { color: colors.text }]}>
        {FM('analytics.detail.topItems')}
      </Text>

      {items.length === 0 ? (
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {FM('analytics.detail.noItemData')}
        </Text>
      ) : (
        <FlatList
          data={items}
          keyExtractor={itemKeyExtractor}
          renderItem={renderItem}
          scrollEnabled={false}
        />
      )}
    </View>
  );
});

TopItemsList.displayName = 'TopItemsList';

function itemKeyExtractor(item: ItemViewEntry): string {
  return item.itemId;
}

export default TopItemsList;
