import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { FM } from '../../../localization/helpers';
import { useTheme } from '../../../theme/hooks/useTheme';

const CARD_PADDING = 20;
const CARD_BORDER_RADIUS = 12;
const CARD_MARGIN_BOTTOM = 16;
const ICON_FONT_SIZE = 28;
const ICON_FONT_SIZE_PHONE = 22;
const COUNT_FONT_SIZE = 32;
const COUNT_FONT_SIZE_PHONE = 24;
const TITLE_FONT_SIZE = 14;
const CTA_FONT_SIZE = 14;
const CTA_MARGIN_TOP = 12;
const HEADER_MARGIN_BOTTOM = 12;
const COUNT_MARGIN_TOP = 4;
const BORDER_WIDTH = 1;
const ICON_MARGIN_RIGHT = 8;

const styles = StyleSheet.create({
  card: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    marginBottom: CARD_MARGIN_BOTTOM,
    borderWidth: BORDER_WIDTH,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: HEADER_MARGIN_BOTTOM,
  },
  icon: {
    fontSize: ICON_FONT_SIZE,
    marginRight: ICON_MARGIN_RIGHT,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '600',
  },
  count: {
    fontSize: COUNT_FONT_SIZE,
    fontWeight: '700',
    marginTop: COUNT_MARGIN_TOP,
  },
  ctaLink: {
    marginTop: CTA_MARGIN_TOP,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: CTA_FONT_SIZE,
    fontWeight: '600',
  },
});

interface Props {
  testID: string;
  ctaTestID: string;
  titleKey: string;
  count: number;
  ctaTextKey: string;
  ctaHintKey: string;
  ctaRoute: string;
  iconName: string;
}

const phoneIconStyle = { fontSize: ICON_FONT_SIZE_PHONE };
const phoneCountStyle = { fontSize: COUNT_FONT_SIZE_PHONE };

const OverviewCard = ({
  testID,
  ctaTestID,
  titleKey,
  count,
  ctaTextKey,
  ctaHintKey,
  ctaRoute,
  iconName,
}: Props): React.ReactElement => {
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const { isPhone } = useBreakpoint();

  const handlePress = useCallback((): void => {
    router.push(ctaRoute);
  }, [router, ctaRoute]);

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}
      testID={testID}
    >
      <View style={styles.header}>
        <Text style={[styles.icon, isPhone && phoneIconStyle]}>{iconName}</Text>
        <Text style={[styles.title, { color: colors.textSecondary }]}>
          {FM(titleKey)}
        </Text>
      </View>
      <Text style={[styles.count, { color: colors.text }, isPhone && phoneCountStyle]}>
        {String(count)}
      </Text>
      <TouchableOpacity
        accessibilityHint={FM(ctaHintKey)}
        accessibilityLabel={FM(ctaTextKey)}
        accessibilityRole="link"
        style={styles.ctaLink}
        testID={ctaTestID}
        onPress={handlePress}
      >
        <Text style={[styles.ctaText, { color: primary }]}>
          {FM(ctaTextKey)} {'\u2192'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OverviewCard;
