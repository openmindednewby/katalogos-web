


/**
 * Topbar layout styles.
 * Provides both static styles (backwards compat) and theme-aware generator.
 */
import { StyleSheet } from 'react-native';

import type { ThemeModeColors } from '../types';

export const topbarStyles = StyleSheet.create({
  topbarContainer: {
    height: 64,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileTopbarContainer: {
    height: 56,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mobileTopbarTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  mobileTopbarButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
  },
  topbarLeft: { flex: 1 },
  topbarRight: { flexDirection: 'row', alignItems: 'center' },
  topbarRowItem: { marginHorizontal: 8, alignItems: 'center' },
  topbarLabel: { fontSize: 14 },
  userBlock: { marginHorizontal: 12, alignItems: 'flex-end' },
  userName: { fontWeight: '600' },
  userEmail: { fontSize: 12 },
  accountBtn: { marginLeft: 8, paddingHorizontal: 10, paddingVertical: 6, borderRadius: 4 },
  accountText: { fontWeight: '600' as const },
});

/** Theme-aware topbar style generator for dynamic color application. */
export function createTopbarStyles(colors: ThemeModeColors): {
  containerColors: { borderBottomColor: string; backgroundColor: string };
  textColor: { color: string };
  subtextColor: { color: string };
} {
  return {
    containerColors: { borderBottomColor: colors.border, backgroundColor: colors.background },
    textColor: { color: colors.text },
    subtextColor: { color: colors.textSecondary },
  };
}
