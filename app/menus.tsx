import React from 'react';

import { LandingLayout, HeroSection, FeatureGrid, CTASection } from '../src/components/Landing';
import { SEOHead } from '../src/components/Shared/SEOHead';
import { FM } from '../src/localization/helpers';

import type { LandingFeature } from '../src/components/Landing/types';

const MENU_FEATURES: readonly LandingFeature[] = [
  { titleKey: 'landing.menus.features.qrCode', descriptionKey: 'landing.menus.features.qrCodeDesc' },
  { titleKey: 'landing.menus.features.liveUpdates', descriptionKey: 'landing.menus.features.liveUpdatesDesc' },
  { titleKey: 'landing.menus.features.customBranding', descriptionKey: 'landing.menus.features.customBrandingDesc' },
  { titleKey: 'landing.menus.features.analytics', descriptionKey: 'landing.menus.features.analyticsDesc' },
  { titleKey: 'landing.menus.features.multiLanguage', descriptionKey: 'landing.menus.features.multiLanguageDesc' },
  { titleKey: 'landing.menus.features.offlineAccess', descriptionKey: 'landing.menus.features.offlineAccessDesc' },
] as const;

/**
 * Dedicated landing page for the Online Menus service.
 * Shows hero, feature grid, and CTA section.
 */
const MenusLandingPage = (): React.ReactElement => {
  return (
    <LandingLayout>
      <SEOHead
        description={FM('landing.menus.seoDescription')}
        title={FM('landing.menus.seoTitle')}
        url="https://app.menuflow.com/menus"
      />
      <HeroSection
        ctaHintKey="landing.menus.heroCtaHint"
        ctaRoute="/(auth)/login"
        ctaTextKey="landing.menus.heroCta"
        subtitleKey="landing.menus.heroSubtitle"
        titleKey="landing.menus.heroTitle"
      />
      <FeatureGrid
        features={MENU_FEATURES}
        sectionTitleKey="landing.menus.features.title"
      />
      <CTASection
        ctaHintKey="landing.menus.cta.buttonHint"
        ctaRoute="/(auth)/login"
        ctaTextKey="landing.menus.cta.button"
        subtitleKey="landing.menus.cta.subtitle"
        titleKey="landing.menus.cta.title"
      />
    </LandingLayout>
  );
};

export default MenusLandingPage;
