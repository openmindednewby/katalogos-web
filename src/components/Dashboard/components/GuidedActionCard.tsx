import React, { useCallback } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { useBreakpoint } from '../../../hooks/useBreakpoint';
import { FM } from '../../../localization/helpers';
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

interface Props {
  testID: string;
  ctaTestID: string;
  titleKey: string;
  descriptionKey: string;
  ctaTextKey: string;
  ctaHintKey: string;
  ctaRoute: string;
  iconName: string;
}

const GuidedActionCard = ({
  testID,
  ctaTestID,
  titleKey,
  descriptionKey,
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
      style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }, isPhone && phoneCardStyle]}
      testID={testID}
    >
      <View style={styles.iconArea}>
        <Text style={styles.icon}>{iconName}</Text>
      </View>
      <View style={[styles.content, isPhone && phoneContentStyle]}>
        <Text style={[styles.title, { color: colors.text }]}>
          {FM(titleKey)}
        </Text>
        <Text style={[styles.description, { color: colors.textSecondary }]}>
          {FM(descriptionKey)}
        </Text>
        <TouchableOpacity
          accessibilityHint={FM(ctaHintKey)}
          accessibilityLabel={FM(ctaTextKey)}
          accessibilityRole="button"
          style={[styles.ctaButton, { backgroundColor: primary }, isPhone && phoneCtaStyle]}
          testID={ctaTestID}
          onPress={handlePress}
        >
          <Text style={[styles.ctaText, { color: colors.background }]}>
            {FM(ctaTextKey)}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default GuidedActionCard;
