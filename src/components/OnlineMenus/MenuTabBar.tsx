/**
 * Tab bar for filtering menus by status.
 */
import React from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';

import MenuTabFilter from '../../shared/enums/MenuTabFilter';
import { TestIds } from '../../shared/testIds';

const TRANSPARENT_COLOR = 'transparent';

const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: 16,
    marginBottom: 8,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

interface TabConfig {
  key: MenuTabFilter;
  labelKey: string;
  testId: string;
}

const TAB_CONFIGS: TabConfig[] = [
  { key: MenuTabFilter.All, labelKey: 'onlineMenus.tabs.all', testId: TestIds.MENU_TAB_ALL },
  { key: MenuTabFilter.Active, labelKey: 'onlineMenus.tabs.active', testId: TestIds.MENU_TAB_ACTIVE },
];

interface Props {
  activeTab: MenuTabFilter;
  onTabChange: (tab: MenuTabFilter) => void;
  primaryColor: string;
  textColor: string;
  borderColor: string;
}

export const MenuTabBar = ({
  activeTab,
  onTabChange,
  primaryColor,
  textColor,
  borderColor,
}: Props): React.ReactElement => {
  const renderTab = (config: TabConfig): React.ReactElement => {
    const isActive = activeTab === config.key;
    const tabBorderColor = isActive ? primaryColor : TRANSPARENT_COLOR;
    const tabTextColor = isActive ? primaryColor : textColor;

    return (
      <TouchableOpacity
        key={config.key}
        accessibilityHint={FM('onlineMenus.tabs.showHint', FM(config.labelKey))}
        accessibilityLabel={FM(config.labelKey)}
        accessibilityRole="tab"
        accessibilityState={{ selected: isActive }}
        style={[styles.tab, { borderBottomColor: tabBorderColor }]}
        testID={config.testId}
        onPress={() => {
          onTabChange(config.key);
        }}
      >
        <Text style={[styles.tabText, { color: tabTextColor }]}>
          {FM(config.labelKey)}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.tabContainer, { borderBottomColor: borderColor }]}>
      {TAB_CONFIGS.map(renderTab)}
    </View>
  );
};
