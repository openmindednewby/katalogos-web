import React from 'react';

import { useLocalSearchParams } from 'expo-router';

import MenuAnalyticsScreen from '../../../../src/components/Analytics/components/MenuAnalyticsScreen';

const MenuAnalyticsPage = (): React.ReactElement => {
  const params = useLocalSearchParams<{ id: string }>();
  const menuId = String(params.id);

  return <MenuAnalyticsScreen menuId={menuId} />;
};

export default MenuAnalyticsPage;
