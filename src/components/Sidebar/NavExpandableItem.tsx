import React, { useCallback, useMemo, useState } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { usePathname, useRouter } from 'expo-router';

import { FM } from '@/localization/helpers';

import { isValueDefined } from '../../utils/is';
import { ICON_PATHS, SvgIcon } from '../Icons';

import type { IconName } from '../Icons';
import type { SidebarItem } from '@baseclient/core';

interface Props {
  item: SidebarItem;
  colors: { text: string; textSecondary: string; border: string };
  primaryColor: string;
  depth?: number;
  onItemPress?: () => void;
}

const BASE_INDENT = 12;
const ICON_SIZE = 14;
const CHEVRON_SIZE = 12;
const ICON_TEXT_GAP = 6;
const ACTIVE_BORDER_RADIUS = 4;

const styles = StyleSheet.create({
  childItem: {
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  childItemText: { fontSize: 14 },
  childItemTextWithIcon: { fontSize: 14, marginLeft: ICON_TEXT_GAP },
  chevron: { marginLeft: 'auto' },
  childrenContainer: { overflow: 'hidden' },
  header: {
    borderRadius: 4,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  headerText: { fontSize: 15, fontWeight: '600', marginLeft: ICON_TEXT_GAP },
  iconWrapper: { width: 20, alignItems: 'center' },
});

function isValidIconName(name: string): name is IconName {
  return name in ICON_PATHS;
}

function resolveIcon(icon: string | undefined): IconName | undefined {
  if (!isValueDefined(icon) || icon === '') return undefined;
  if (isValidIconName(icon)) return icon;
  return undefined;
}

/** Check if a route matches the current pathname. */
function isRouteActive(currentPath: string, route: string): boolean {
  if (route === '/') return currentPath === '/';
  return currentPath === route || currentPath.startsWith(`${route}/`);
}

const NavExpandableItem = ({
  item,
  colors,
  primaryColor,
  depth = 0,
  onItemPress,
}: Props): React.ReactElement => {
  const [expanded, setExpanded] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggle = useCallback(() => setExpanded((v) => !v), []);

  const indent = depth * BASE_INDENT;
  const hasChildren = isValueDefined(item.children) && item.children.length > 0;
  const icon = resolveIcon(item.icon);
  const hasIcon = isValueDefined(icon);
  const isActive = isRouteActive(pathname, item.route);

  const activeItemStyle = useMemo(
    () => ({ backgroundColor: colors.border, borderRadius: ACTIVE_BORDER_RADIUS }),
    [colors.border],
  );

  const paddingStyle = useMemo(
    () => ({ paddingLeft: indent + BASE_INDENT }),
    [indent],
  );
  const headerPaddingStyle = useMemo(
    () => ({ paddingLeft: indent }),
    [indent],
  );

  if (!hasChildren)
    return (
      <TouchableOpacity
        accessibilityHint={FM('menu.navigateToHint', FM(item.labelKey))}
        accessibilityLabel={FM(item.labelKey)}
        accessibilityRole="button"
        style={[styles.childItem, paddingStyle, isActive ? activeItemStyle : undefined]}
        testID={item.key}
        onPress={() => {
          router.push(item.route);
          onItemPress?.();
        }}
      >
        {hasIcon ? (
          <View style={styles.iconWrapper}>
            <SvgIcon color={colors.textSecondary} name={icon} size={ICON_SIZE} />
          </View>
        ) : null}
        <Text style={[hasIcon ? styles.childItemTextWithIcon : styles.childItemText, { color: isActive ? primaryColor : colors.text }]}>
          {FM(item.labelKey)}
        </Text>
      </TouchableOpacity>
    );

  return (
    <View>
      <TouchableOpacity
        accessibilityHint={expanded ? FM('menu.collapseSection') : FM('menu.expandSection')}
        accessibilityLabel={FM(item.labelKey)}
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        style={[styles.header, headerPaddingStyle]}
        testID={item.key}
        onPress={toggle}
      >
        {hasIcon ? (
          <View style={styles.iconWrapper}>
            <SvgIcon color={colors.text} name={icon} size={ICON_SIZE} />
          </View>
        ) : null}
        <Text style={[styles.headerText, { color: colors.text }]}>
          {FM(item.labelKey)}
        </Text>
        <View style={styles.chevron}>
          <SvgIcon
            color={colors.textSecondary}
            name={expanded ? 'chevronUp' : 'chevronDown'}
            size={CHEVRON_SIZE}
          />
        </View>
      </TouchableOpacity>

      {expanded ? (
        <View style={styles.childrenContainer}>
          {item.children?.map((child) => (
            <NavExpandableItem
              key={child.key}
              colors={colors}
              depth={depth + 1}
              item={child}
              primaryColor={primaryColor}
              onItemPress={onItemPress}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
};

export default NavExpandableItem;
