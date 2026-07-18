/**
 * Sidebar layout styles.
 * Provides both static styles (backwards compat) and theme-aware generator.
 */
import { StyleSheet } from 'react-native';

export const sidebarStyles = StyleSheet.create({
  sidebarContainer: {
    width: 220,
    paddingTop: 24,
    paddingHorizontal: 12,
    borderRightWidth: 1,
    height: '100%',
  },
  sidebarTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
});
