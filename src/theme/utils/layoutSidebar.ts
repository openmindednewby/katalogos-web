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
  mobileSidebarCollapsed: {
    width: 56,
    paddingTop: 16,
    paddingHorizontal: 8,
    borderRightWidth: 1,
    height: '100%',
    alignItems: 'center',
  },
  mobileSidebarIconButton: {
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mobileSidebarIconLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  mobileSidebarToggleText: {
    fontWeight: '700',
    fontSize: 14,
  },
  sidebarTitle: {
    fontWeight: '700',
    marginBottom: 12,
  },
  sidebarItem: {
    paddingVertical: 10,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  sidebarItemText: {
    fontSize: 16,
  },
  sidebarSpacer: {
    flex: 1,
  },
});
