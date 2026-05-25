import React, { memo, useCallback } from 'react';

import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { ListRenderItemInfo } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { useTheme } from '@/theme/hooks/useTheme';

import type { TopMenuDto } from '../types';

const LIST_PADDING = 16;
const TITLE_FONT_SIZE = 16;
const TITLE_MARGIN_BOTTOM = 12;
const ROW_PADDING_VERTICAL = 10;
const ROW_BORDER_BOTTOM_WIDTH = 1;
const MENU_NAME_FONT_SIZE = 15;
const SCAN_COUNT_FONT_SIZE = 14;
const EMPTY_TEXT_FONT_SIZE = 14;
const EMPTY_PADDING_VERTICAL = 20;

const styles = StyleSheet.create({
  container: {
    padding: LIST_PADDING,
  },
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
  menuName: {
    fontSize: MENU_NAME_FONT_SIZE,
    fontWeight: '500',
    flex: 1,
  },
  scanCount: {
    fontSize: SCAN_COUNT_FONT_SIZE,
  },
  emptyText: {
    fontSize: EMPTY_TEXT_FONT_SIZE,
    textAlign: 'center',
    paddingVertical: EMPTY_PADDING_VERTICAL,
  },
});

interface TopMenusListProps {
  menus: TopMenuDto[];
  testID: string;
  onMenuPress?: (menuId: string) => void;
}

const TopMenusList = memo(({ menus, testID, onMenuPress }: TopMenusListProps): React.ReactElement => {
  const { theme } = useTheme();
  const { colors } = theme;

  const renderItem = useCallback(({ item }: ListRenderItemInfo<TopMenuDto>): React.ReactElement => {
    const scanLabel = FM('analytics.scanCount', String(item.scanCount));

    const rowContent = (
      <View
        accessibilityHint={FM('analytics.topMenuItemHint', scanLabel)}
        accessibilityLabel={FM('analytics.topMenuItemLabel', item.menuName, scanLabel)}
        style={[styles.row, { borderBottomColor: colors.border }]}
        testID={TestIds.ANALYTICS_TOP_MENU_ITEM}
      >
        <Text style={[styles.menuName, { color: colors.text }]}>
          {item.menuName}
        </Text>
        <Text style={[styles.scanCount, { color: colors.textSecondary }]}>
          {scanLabel}
        </Text>
      </View>
    );

    if (onMenuPress)
      return (
        <TouchableOpacity
          accessibilityHint={FM('analytics.topMenuPressHint')}
          accessibilityLabel={item.menuName}
          accessibilityRole="button"
          testID={`${TestIds.ANALYTICS_TOP_MENU_ITEM}-press`}
          onPress={() => onMenuPress(item.menuId)}
        >
          {rowContent}
        </TouchableOpacity>
      );

    return rowContent;
  }, [colors, onMenuPress]);

  if (menus.length === 0)
    return (
      <View style={styles.container} testID={testID}>
        <Text style={[styles.title, { color: colors.text }]}>
          {FM('analytics.topMenus')}
        </Text>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
          {FM('analytics.noData')}
        </Text>
      </View>
    );

  return (
    <View style={styles.container} testID={testID}>
      <Text style={[styles.title, { color: colors.text }]}>
        {FM('analytics.topMenus')}
      </Text>
      <FlatList
        data={menus}
        keyExtractor={menuKeyExtractor}
        renderItem={renderItem}
        scrollEnabled={false}
      />
    </View>
  );
});

TopMenusList.displayName = 'TopMenusList';

function menuKeyExtractor(item: TopMenuDto): string {
  return item.menuId;
}

export default TopMenusList;
