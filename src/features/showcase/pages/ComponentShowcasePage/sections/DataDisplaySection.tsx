/**
 * Data Display components showcase section.
 * Demonstrates: GenericStatusBadge, Tabs, EmptyListState.
 */
import type { ReactElement } from 'react';
import { useCallback, useState } from 'react';

import { StyleSheet, View } from 'react-native';

import { FM } from '@/localization/helpers';

import EmptyListState from '../../../../../components/Shared/EmptyListState';
import Tabs from '../../../../../components/Shared/Tabs';
import GenericStatusBadge from '../../../../../components/Status/GenericStatusBadge';
import ComponentCard from '../ComponentCard';

const BADGE_GAP = 8;

const styles = StyleSheet.create({
  badgeRow: { flexDirection: 'row', gap: BADGE_GAP },
});

const DataDisplaySection = (): ReactElement => {
  const demoTabs = [
    { key: 'overview', label: FM('showcase.tabOne') },
    { key: 'details', label: FM('showcase.tabTwo') },
    { key: 'settings', label: FM('showcase.tabThree') },
  ];

  const [activeTab, setActiveTab] = useState('overview');

  const handleTabChange = useCallback((key: string) => {
    setActiveTab(key);
  }, []);

  return (
    <div>
      <ComponentCard
        descriptionKey="showcase.componentGenericStatusBadgeDesc"
        importPath="@/components/Status/GenericStatusBadge"
        nameKey="showcase.componentGenericStatusBadge"
      >
        <View style={styles.badgeRow}>
          <GenericStatusBadge status testID="demo-badge-active" />
          <GenericStatusBadge status={false} testID="demo-badge-inactive" />
          <GenericStatusBadge status={1} testID="demo-badge-numeric" />
          <GenericStatusBadge status={0} testID="demo-badge-zero" />
        </View>
      </ComponentCard>

      <ComponentCard
        descriptionKey="showcase.componentTabsDesc"
        importPath="@/components/Shared/Tabs"
        nameKey="showcase.componentTabs"
      >
        <Tabs
          activeKey={activeTab}
          tabs={demoTabs}
          onChange={handleTabChange}
        />
      </ComponentCard>

      <ComponentCard
        descriptionKey="showcase.componentEmptyListStateDesc"
        importPath="@/components/Shared/EmptyListState"
        nameKey="showcase.componentEmptyListState"
      >
        <EmptyListState
          messageKey="showcase.noItems"
          testID="demo-empty-list"
        />
      </ComponentCard>
    </div>
  );
};

export default DataDisplaySection;
