import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { FM } from '../../../localization/helpers';
import { Routes } from '../../../navigation/routes';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';

const CARD_PADDING = 20;
const CARD_BORDER_RADIUS = 12;
const CARD_MARGIN_BOTTOM = 16;
const ICON_FONT_SIZE = 36;
const ICON_AREA_WIDTH = 56;
const TITLE_FONT_SIZE = 18;
const DESCRIPTION_FONT_SIZE = 14;
const DESCRIPTION_MARGIN_TOP = 6;
const CTA_MARGIN_TOP = 16;
const CTA_PADDING_VERTICAL = 12;
const CTA_PADDING_HORIZONTAL = 20;
const CTA_BORDER_RADIUS = 8;
const CTA_FONT_SIZE = 15;
const CONTENT_MARGIN_LEFT = 16;
const DESCRIPTION_LINE_HEIGHT = 20;
const BORDER_WIDTH = 1;

const ICON_BUSINESS = '\uD83C\uDFE2';

const phoneCardStyle = { flexDirection: 'column' as const, alignItems: 'center' as const };
const phoneContentStyle = { marginLeft: 0, alignItems: 'center' as const };
const phoneCtaStyle = { alignSelf: 'center' as const };

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    marginBottom: CARD_MARGIN_BOTTOM,
    borderWidth: BORDER_WIDTH,
  },
  iconArea: {
    width: ICON_AREA_WIDTH,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: ICON_FONT_SIZE,
  },
  content: {
    flex: 1,
    marginLeft: CONTENT_MARGIN_LEFT,
  },
  title: {
    fontSize: TITLE_FONT_SIZE,
    fontWeight: '700',
  },
  description: {
    fontSize: DESCRIPTION_FONT_SIZE,
    marginTop: DESCRIPTION_MARGIN_TOP,
    lineHeight: DESCRIPTION_LINE_HEIGHT,
  },
  ctaButton: {
    marginTop: CTA_MARGIN_TOP,
    paddingVertical: CTA_PADDING_VERTICAL,
    paddingHorizontal: CTA_PADDING_HORIZONTAL,
    borderRadius: CTA_BORDER_RADIUS,
    alignSelf: 'flex-start',
  },
  ctaText: {
    fontSize: CTA_FONT_SIZE,
    fontWeight: '600',
  },
});

const BusinessProfileNudge = (): React.ReactElement => {
  const router = useRouter();
  const { theme } = useTheme();
  const { colors } = theme;
  const primary = theme.palette.primary['500'];
  const { isPhone } = useBreakpoint();

  const handlePress = useCallback((): void => {
    router.push(Routes.BUSINESS_PROFILE_SETTINGS);
  }, [router]);

  return (
    <View
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, isPhone && phoneCardStyle]}
      testID={TestIds.DASHBOARD_BUSINESS_PROFILE_NUDGE}
    >
      <View style={styles.iconArea}>
        <Text style={styles.icon}>{ICON_BUSINESS}</Text>
      </View>
      <View style={[styles.content, isPhone && phoneContentStyle]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {FM('dashboard.businessProfileNudge.title')}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {FM('dashboard.businessProfileNudge.description')}
        </Text>
        <TouchableOpacity
          accessibilityHint={FM('dashboard.businessProfileNudge.ctaHint')}
          accessibilityLabel={FM('dashboard.businessProfileNudge.cta')}
          accessibilityRole="button"
          style={[styles.ctaButton, { backgroundColor: primary }, isPhone && phoneCtaStyle]}
          testID={TestIds.DASHBOARD_BUSINESS_PROFILE_NUDGE_CTA}
          onPress={handlePress}
        >
          <Text style={[styles.ctaText, { color: colors.background }]}>
            {FM('dashboard.businessProfileNudge.cta')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default BusinessProfileNudge;
