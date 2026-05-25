/**
 * BreadcrumbBar - Generic breadcrumb navigation for modal contexts.
 * Unlike the route-based Breadcrumb component, this accepts crumb items directly
 * and does not depend on the router. Phone viewports show last 2 items with ellipsis.
 */
import React, { useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { FM } from '@/localization/helpers';
import { TestIds } from '@/shared/testIds';
import { isValueDefined } from '@/utils/is';

import { useTheme } from '../../theme/hooks/useTheme';

import type { BreadcrumbCrumb } from '../OnlineMenus/hooks/useBreadcrumbState';

const FONT_SIZE = 13;
const SEPARATOR_MARGIN = 4;
const VERTICAL_PADDING = 6;
const BOTTOM_MARGIN = 8;
const CURRENT_FONT_WEIGHT = '600' as const;
const PHONE_MAX_CRUMBS = 2;

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', paddingVertical: VERTICAL_PADDING, marginBottom: BOTTOM_MARGIN },
  parentText: { fontSize: FONT_SIZE },
  separator: { fontSize: FONT_SIZE, marginHorizontal: SEPARATOR_MARGIN },
  currentText: { fontSize: FONT_SIZE, fontWeight: CURRENT_FONT_WEIGHT },
  ellipsis: { fontSize: FONT_SIZE, marginHorizontal: SEPARATOR_MARGIN },
});

interface Props {
  crumbs: BreadcrumbCrumb[];
  isPhone: boolean;
}

const BreadcrumbBar = ({ crumbs, isPhone }: Props): React.ReactElement | null => {
  const { theme } = useTheme();
  const { colors } = theme;

  const visibleCrumbs = useMemo(() => {
    if (!isPhone || crumbs.length <= PHONE_MAX_CRUMBS) return crumbs;
    return crumbs.slice(-PHONE_MAX_CRUMBS);
  }, [crumbs, isPhone]);

  const showEllipsis = isPhone && crumbs.length > PHONE_MAX_CRUMBS;

  const parentColor = useMemo(() => ({ color: colors.textSecondary }), [colors.textSecondary]);
  const currentColor = useMemo(() => ({ color: colors.text }), [colors.text]);
  const separatorColor = useMemo(() => ({ color: colors.textSecondary }), [colors.textSecondary]);

  if (crumbs.length === 0) return null;

  const lastIndex = visibleCrumbs.length - 1;

  return (
    <View accessibilityRole="toolbar" style={styles.container} testID={TestIds.BREADCRUMB_BAR}>
      {showEllipsis ? (
        <Text accessible={false} style={[styles.ellipsis, separatorColor]}>
          {FM('onlineMenus.breadcrumb.ellipsis')}
        </Text>
      ) : null}
      {visibleCrumbs.map((crumb, index) => {
        const isLast = index === lastIndex;
        const key = `${crumb.label}-${String(index)}`;

        return (
          <React.Fragment key={key}>
            {index > 0 ? (
              <Text accessible={false} style={[styles.separator, separatorColor]} testID={TestIds.BREADCRUMB_SEPARATOR}>
                {FM('breadcrumb.separator')}
              </Text>
            ) : null}
            {isLast ? (
              <Text
                accessibilityHint={FM('onlineMenus.breadcrumb.currentPageHint', crumb.label)}
                accessibilityLabel={crumb.label}
                style={[styles.currentText, currentColor]}
                testID={TestIds.BREADCRUMB_ITEM}
              >
                {crumb.label}
              </Text>
            ) : (
              <TouchableOpacity
                accessibilityHint={FM('onlineMenus.breadcrumb.onlineMenusHint')}
                accessibilityLabel={crumb.label}
                accessibilityRole="button"
                disabled={!isValueDefined(crumb.onPress)}
                testID={TestIds.BREADCRUMB_ITEM}
                onPress={crumb.onPress}
              >
                <Text style={[styles.parentText, parentColor]}>{crumb.label}</Text>
              </TouchableOpacity>
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default BreadcrumbBar;
