/**
 * Drawer and overlay layout styles.
 */
import { StyleSheet } from 'react-native';

export const drawerStyles = StyleSheet.create({
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
