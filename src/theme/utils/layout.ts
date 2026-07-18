


// Combine all styles for backwards compatibility
/**
 * Layout styles for sidebar, topbar, and page structure.
 * Re-exports split layout modules for backwards compatibility.
 */
import { StyleSheet } from 'react-native';

import { drawerStyles } from './layoutDrawer';
import { formStyles } from './layoutForms';
import { sidebarStyles } from './layoutSidebar';
import { topbarStyles } from './layoutTopbar';

const LIGHT_BORDER_COLOR = '#ddd';

// Core layout styles that tie everything together
const coreLayoutStyles = StyleSheet.create({
  // Page helpers
  container: {
    flex: 1,
    padding: 16,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 12,
  },

  // Spacing utilities
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

  // List item
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
  // Override listItem to include border color
  listItem: {
    ...coreLayoutStyles.listItem,
    borderColor: LIGHT_BORDER_COLOR,
  },
});
