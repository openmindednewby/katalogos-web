


import { StyleSheet } from 'react-native';

import { drawerStyles } from './layoutDrawer';
import { formStyles } from './layoutForms';
import { sidebarStyles } from './layoutSidebar';
import { topbarStyles } from './layoutTopbar';

const LIGHT_BORDER_COLOR = '#ddd';

const coreLayoutStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },

  sectionSpacing: {
    marginTop: 12,
  },
  itemSpacing: {
    marginBottom: 12,
  },
  itemSpacingSmall: {
    marginTop: 6,
  },
  actionRowWrapper: {
    marginTop: 12,
  },

  listItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    marginBottom: 6,
  },
});

export const layoutStyles = StyleSheet.create({
  ...sidebarStyles,
  ...topbarStyles,
  ...formStyles,
  ...drawerStyles,
  ...coreLayoutStyles,
  listItem: {
    ...coreLayoutStyles.listItem,
    borderColor: LIGHT_BORDER_COLOR,
  },
});
