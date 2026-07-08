import React, { useEffect } from 'react';

import { StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { LandingLayout, PricingCard } from '../src/components/Landing';
import {
  LANDING_MAX_WIDTH,
  LANDING_SECTION_PADDING_HORIZONTAL,
  LANDING_SECTION_PADDING_VERTICAL,
} from '../src/components/Landing/constants';
import { MARKETING_PALETTE } from '../src/components/Landing/utils/brand';
import { SEOHead } from '../src/components/Shared/SEOHead';
import { useAnalytics } from '../src/lib/analytics';
import { FM } from '../src/localization/helpers';
import { TABLET_BREAKPOINT_PX, DESKTOP_BREAKPOINT_PX } from '../src/shared/constants';
import AnalyticsEventName from '../src/shared/enums/AnalyticsEventName';
import { TestIds } from '../src/shared/testIds';

const PRICING_CARD_GAP = 20;
const TITLE_DESKTOP = 40;
const TITLE_MOBILE = 30;
const SUBTITLE_SIZE = 18;
const LOGIN_ROUTE = '/(auth)/login';

const styles = StyleSheet.create({
  outer: { width: '100%', backgroundColor: MARKETING_PALETTE.gray100 },
  section: {
    width: '100%',
    maxWidth: LANDING_MAX_WIDTH,
    alignSelf: 'center',
    paddingHorizontal: LANDING_SECTION_PADDING_HORIZONTAL,
    paddingVertical: LANDING_SECTION_PADDING_VERTICAL,
  },
  title: { fontWeight: '800', textAlign: 'center', letterSpacing: -0.5, marginBottom: 12 },
  subtitle: { fontSize: SUBTITLE_SIZE, textAlign: 'center', marginBottom: 48 },
  cardsRow: { flexDirection: 'row', gap: PRICING_CARD_GAP, flexWrap: 'wrap', justifyContent: 'center' },
  cardsColumn: { gap: PRICING_CARD_GAP },
});

const TRIAL_FEATURE_KEYS = [
  'landing.pricing.trial.feature1',
  'landing.pricing.trial.feature2',
  'landing.pricing.trial.feature3',
  'landing.pricing.trial.feature4',
  'landing.pricing.trial.feature5',
  'landing.pricing.trial.feature6',
] as const;

const FREE_FEATURE_KEYS = [
  'landing.pricing.free.feature1',
  'landing.pricing.free.feature2',
  'landing.pricing.free.feature3',
  'landing.pricing.free.feature4',
  'landing.pricing.free.feature5',
] as const;

const PRO_FEATURE_KEYS = [
  'landing.pricing.pro.feature1',
  'landing.pricing.pro.feature2',
  'landing.pricing.pro.feature3',
  'landing.pricing.pro.feature4',
  'landing.pricing.pro.feature5',
  'landing.pricing.pro.feature6',
] as const;

const ENTERPRISE_FEATURE_KEYS = [
  'landing.pricing.enterprise.feature1',
  'landing.pricing.enterprise.feature2',
  'landing.pricing.enterprise.feature3',
  'landing.pricing.enterprise.feature4',
  'landing.pricing.enterprise.feature5',
  'landing.pricing.enterprise.feature6',
] as const;

/**
 * Pricing page showing four tiers side-by-side: Trial / Free+Ads / Paid (No Ads) / Paid Full.
 * Pro (No Ads) is highlighted as the recommended tier.
 *
 * Background uses the locked Katalogos cream gray-100 to match the marketing identity.
 * Responsive: 4 columns on desktop (wraps to 2x2 on tablet), single-column on mobile.
 */
const PricingPage = (): React.ReactElement => {
  const { width } = useWindowDimensions();
  const { track } = useAnalytics();

  useEffect(() => {
    track(AnalyticsEventName.UpgradeViewed, { product: 'katalogos' });
  }, [track]);

  const isDesktop = width > DESKTOP_BREAKPOINT_PX;
  const isMobile = width <= TABLET_BREAKPOINT_PX;

  return (
    <LandingLayout>
      <SEOHead
        description={FM('landing.pricing.seoDescription')}
        title={FM('landing.pricing.seoTitle')}
      />
      <View style={styles.outer}>
        <View style={styles.section} testID={TestIds.LANDING_PRICING_GRID}>
          <Text
            style={[
              styles.title,
              { fontSize: isMobile ? TITLE_MOBILE : TITLE_DESKTOP, color: MARKETING_PALETTE.gray900 },
            ]}
          >
            {FM('landing.pricing.title')}
          </Text>
          <Text style={[styles.subtitle, { color: MARKETING_PALETTE.gray700 }]}>
            {FM('landing.pricing.subtitle')}
          </Text>

          <View style={isDesktop ? styles.cardsRow : styles.cardsColumn}>
            <PricingCard
              ctaHintKey="landing.pricing.trial.ctaHint"
              ctaKey="landing.pricing.trial.cta"
              ctaRoute={LOGIN_ROUTE}
              featureKeys={TRIAL_FEATURE_KEYS}
              nameKey="landing.pricing.trial.name"
              periodKey="landing.pricing.trial.period"
              priceKey="landing.pricing.trial.price"
            />
            <PricingCard
              ctaHintKey="landing.pricing.free.ctaHint"
              ctaKey="landing.pricing.free.cta"
              ctaRoute={LOGIN_ROUTE}
              featureKeys={FREE_FEATURE_KEYS}
              nameKey="landing.pricing.free.name"
              periodKey="landing.pricing.free.period"
              priceKey="landing.pricing.free.price"
            />
            <PricingCard
              highlighted
              ctaHintKey="landing.pricing.pro.ctaHint"
              ctaKey="landing.pricing.pro.cta"
              ctaRoute={LOGIN_ROUTE}
              featureKeys={PRO_FEATURE_KEYS}
              nameKey="landing.pricing.pro.name"
              periodKey="landing.pricing.pro.period"
              priceKey="landing.pricing.pro.price"
            />
            <PricingCard
              ctaHintKey="landing.pricing.enterprise.ctaHint"
              ctaKey="landing.pricing.enterprise.cta"
              ctaRoute={LOGIN_ROUTE}
              featureKeys={ENTERPRISE_FEATURE_KEYS}
              nameKey="landing.pricing.enterprise.name"
              periodKey="landing.pricing.enterprise.period"
              priceKey="landing.pricing.enterprise.price"
            />
          </View>
        </View>
      </View>
    </LandingLayout>
  );
};

export default PricingPage;
