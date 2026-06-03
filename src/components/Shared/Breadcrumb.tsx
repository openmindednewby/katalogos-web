/**
 * Breadcrumb navigation bar for settings sub-pages.
 * Shows parent crumbs as tappable links with separators and the current page as plain text.
 * Returns null when the crumb trail has fewer than 2 items.
 */
import React, { useCallback, useMemo } from 'react';

import { StyleSheet, Text, TouchableOpacity, View, type StyleProp, type TextStyle } from 'react-native';

import { useRouter } from 'expo-router';

import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { FM } from '../../localization/helpers';
import { TestIds } from '../../shared/testIds';
import { useTheme } from '../../theme/hooks/useTheme';
import { isValueDefined } from '../../utils/is';

import type { BreadcrumbItem } from '../../navigation/breadcrumbMap';
import type { Routes } from '../../navigation/routes';

const BREADCRUMB_FONT_SIZE = 13;
const BREADCRUMB_SEPARATOR_MARGIN = 4;
const BREADCRUMB_VERTICAL_PADDING = 6;
const BREADCRUMB_BOTTOM_MARGIN = 8;
const CURRENT_CRUMB_FONT_WEIGHT = '600' as const;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    paddingVertical: BREADCRUMB_VERTICAL_PADDING,
    marginBottom: BREADCRUMB_BOTTOM_MARGIN,
  },
  parentText: {
    fontSize: BREADCRUMB_FONT_SIZE,
  },
  separator: {
    fontSize: BREADCRUMB_FONT_SIZE,
    marginHorizontal: BREADCRUMB_SEPARATOR_MARGIN,
  },
  currentText: {
    fontSize: BREADCRUMB_FONT_SIZE,
    fontWeight: CURRENT_CRUMB_FONT_WEIGHT,
  },
});

interface Props {
  dynamicLabel?: string;
  testID?: string;
}

/** Renders a single parent breadcrumb with a trailing separator. */
const ParentCrumb = ({
  crumb,
  parentStyle,
  separatorStyle,
  onPress,
}: {
  crumb: BreadcrumbItem;
  parentStyle: StyleProp<TextStyle>;
  separatorStyle: StyleProp<TextStyle>;
  onPress: (route: Routes) => void;
}): React.ReactElement => {
  const handlePress = useCallback(() => {
    if (isValueDefined(crumb.route)) onPress(crumb.route);
  }, [crumb.route, onPress]);

  return (
    <>
      <TouchableOpacity
        accessibilityHint={FM('breadcrumb.navigateToHint', FM(crumb.labelKey))}
        accessibilityLabel={FM(crumb.labelKey)}
        accessibilityRole="button"
        testID={TestIds.BREADCRUMB_ITEM}
        onPress={handlePress}
      >
        <Text style={parentStyle}>{FM(crumb.labelKey)}</Text>
      </TouchableOpacity>
      <Text
        style={separatorStyle}
        testID={TestIds.BREADCRUMB_SEPARATOR}
      >
        {FM('breadcrumb.separator')}
      </Text>
    </>
  );
}

const Breadcrumb = ({ dynamicLabel, testID }: Props): React.ReactElement | null => {
  const crumbs = useBreadcrumbs(dynamicLabel);
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme;

  const handlePress = useCallback(
    (route: Routes) => {
      router.push(route);
    },
    [router],
  );

  const parentStyle = useMemo<StyleProp<TextStyle>>(
    () => [styles.parentText, { color: colors.textSecondary }],
    [colors.textSecondary],
  );

  const separatorStyle = useMemo<StyleProp<TextStyle>>(
    () => [styles.separator, { color: colors.textSecondary }],
    [colors.textSecondary],
  );

  const currentStyle = useMemo(
    () => [styles.currentText, { color: colors.text }],
    [colors.text],
  );

  if (crumbs.length <= 1) return null;

  const parentCrumbs = crumbs.slice(0, -1);
  const currentCrumb = crumbs[crumbs.length - 1];

  return (
    <View
      style={styles.container}
      testID={testID ?? TestIds.BREADCRUMB_BAR}
    >
      {parentCrumbs.map((crumb: BreadcrumbItem) => (
        <ParentCrumb
          key={crumb.labelKey}
          crumb={crumb}
          parentStyle={parentStyle}
          separatorStyle={separatorStyle}
          onPress={handlePress}
        />
      ))}
      <Text
        accessibilityRole="text"
        style={currentStyle}
        testID={TestIds.BREADCRUMB_ITEM}
      >
        {FM(currentCrumb.labelKey)}
      </Text>
    </View>
  );
};

export default Breadcrumb;
