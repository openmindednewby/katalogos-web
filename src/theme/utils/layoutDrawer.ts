/**
 * Drawer and overlay layout styles.
 */
import { StyleSheet } from 'react-native';

export const drawerStyles = StyleSheet.create({
  // Overlay and drawer
  overlayBackdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  },
  drawerPanelLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    width: '80%',
    paddingTop: 12,
    paddingHorizontal: 12,
    borderRightWidth: 1,
  },
  drawerPanelRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    height: '100%',
    width: '80%',
    padding: 16,
    borderLeftWidth: 1,
  },
  drawerItem: {
    paddingVertical: 12,
  },
  drawerItemText: {
    fontSize: 16,
    fontWeight: '600',
  },

  // Dropdown panels
  dropdownPanel: {
    position: 'absolute',
    top: 56,
    left: 8,
    right: 8,
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
  },
  dropdownPanelFull: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    borderWidth: 1,
    borderRadius: 0,
    padding: 12,
  },
});
