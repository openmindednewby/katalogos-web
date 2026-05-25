import type { ReactElement } from 'react';

import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { useRouter } from 'expo-router';

import { FM } from '../../../localization/helpers';
import { TestIds } from '../../../shared/testIds';
import { useTheme } from '../../../theme/hooks/useTheme';
import {
  BUTTON_BORDER_RADIUS,
  CARD_BORDER_RADIUS,
  HIGHLIGHTED_BORDER_WIDTH,
} from '../constants';

interface Props {
  nameKey: string;
  priceKey: string;
  periodKey: string;
  ctaKey: string;
  ctaHintKey: string;
  featureKeys: readonly string[];
  ctaRoute: string;
  highlighted?: boolean;
}

const CARD_PADDING = 32;
const NAME_FONT_SIZE = 18;
const PRICE_FONT_SIZE = 44;
const PRICE_SMALL_FONT_SIZE = 22;
const CURRENCY_FONT_SIZE = 22;
const PERIOD_FONT_SIZE = 14;
const FEATURE_FONT_SIZE = 14;
const CTA_FONT_SIZE = 15;
const CTA_PADDING_V = 14;
const CHECKMARK_SIZE = 14;
const CHECKMARK_SYMBOL = '\u2713';
const DEFAULT_BORDER_WIDTH = 1;

const styles = StyleSheet.create({
  card: {
    padding: CARD_PADDING,
    borderRadius: CARD_BORDER_RADIUS,
    borderWidth: DEFAULT_BORDER_WIDTH,
    boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.08)',
    elevation: 4,
    flex: 1,
  },
  cardHighlighted: { borderWidth: HIGHLIGHTED_BORDER_WIDTH },
  name: { fontSize: NAME_FONT_SIZE, fontWeight: '700', marginBottom: 16 },
  priceRow: { flexDirection: 'row', alignItems: 'flex-end', marginBottom: 8 },
  currencySymbol: { fontSize: CURRENCY_FONT_SIZE, fontWeight: '700', marginBottom: 6 },
  price: { fontSize: PRICE_FONT_SIZE, fontWeight: '800', letterSpacing: -1 },
  priceSmall: { fontSize: PRICE_SMALL_FONT_SIZE, fontWeight: '800', letterSpacing: -1 },
  period: { fontSize: PERIOD_FONT_SIZE, marginBottom: 8, marginLeft: 4 },
  divider: { height: 1, marginVertical: 24 },
  featureList: { gap: 12, marginBottom: 32 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkmark: { fontSize: CHECKMARK_SIZE, marginTop: 2 },
  featureText: { fontSize: FEATURE_FONT_SIZE, lineHeight: 20, flex: 1 },
  ctaButton: {
    paddingVertical: CTA_PADDING_V,
    borderRadius: BUTTON_BORDER_RADIUS,
    alignItems: 'center',
  },
  ctaButtonDefault: { borderWidth: DEFAULT_BORDER_WIDTH },
  ctaText: { fontSize: CTA_FONT_SIZE, fontWeight: '700' },
});

/**
 * Pricing tier card showing plan name, price, features checklist, and CTA button.
 * Highlighted variant gets an accent border for the recommended tier.
 */
const PricingCard = ({
  nameKey,
  priceKey,
  periodKey,
  ctaKey,
  ctaHintKey,
  featureKeys,
  ctaRoute,
  highlighted = false,
}: Props): ReactElement => {
  const { theme } = useTheme();
  const router = useRouter();

  const colors = theme.colors;
  const primaryColor = theme.palette.primary[500];
  const priceValue = FM(priceKey);
  const isNumericPrice = /^\d+$/.test(priceValue);
  const periodValue = FM(periodKey);

  function handlePress(): void {
    router.push(ctaRoute);
  }

  const cardStyle = highlighted
    ? [styles.card, styles.cardHighlighted, { backgroundColor: colors.surface, borderColor: primaryColor }]
    : [styles.card, { backgroundColor: colors.surface, borderColor: colors.border }];

  const ctaStyle = highlighted
    ? [styles.ctaButton, { backgroundColor: primaryColor }]
    : [styles.ctaButton, styles.ctaButtonDefault, { backgroundColor: colors.background, borderColor: colors.border }];

  return (
    <View style={cardStyle} testID={TestIds.LANDING_PRICING_CARD}>
      <Text style={[styles.name, { color: colors.text }]}>{FM(nameKey)}</Text>

      <View style={styles.priceRow}>
        {isNumericPrice ? <>
            <Text style={[styles.currencySymbol, { color: colors.text }]}>
              {FM('landing.pricing.currencySymbol')}
            </Text>
            <Text style={[styles.price, { color: colors.text }]}>{priceValue}</Text>
          </> : null}
        {!isNumericPrice && (
          <Text style={[styles.priceSmall, { color: colors.text }]}>{priceValue}</Text>
        )}
      </View>

      {periodValue !== '' && (
        <Text style={[styles.period, { color: colors.textSecondary }]}>
          {isNumericPrice ? FM('landing.pricing.perMonth') : periodValue}
        </Text>
      )}

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.featureList}>
        {featureKeys.map((key) => (
          <View key={key} style={styles.featureRow}>
            <Text style={[styles.checkmark, { color: primaryColor }]}>{CHECKMARK_SYMBOL}</Text>
            <Text style={[styles.featureText, { color: colors.text }]}>{FM(key)}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity
        accessibilityHint={FM(ctaHintKey)}
        accessibilityLabel={FM(ctaKey)}
        accessibilityRole="button"
        style={ctaStyle}
        onPress={handlePress}
      >
        <Text style={[styles.ctaText, { color: highlighted ? colors.surface : colors.text }]}>
          {FM(ctaKey)}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default PricingCard;
