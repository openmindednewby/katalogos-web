import React from 'react';

import { LandingLayout, HeroSection, FeatureGrid, CTASection } from '../src/components/Landing';
import { SEOHead } from '../src/components/Shared/SEOHead';
import { FM } from '../src/localization/helpers';

import type { LandingFeature } from '../src/components/Landing/types';

const QUESTIONNAIRE_FEATURES: readonly LandingFeature[] = [
  { titleKey: 'landing.questionnaires.features.templates', descriptionKey: 'landing.questionnaires.features.templatesDesc' },
  { titleKey: 'landing.questionnaires.features.customizable', descriptionKey: 'landing.questionnaires.features.customizableDesc' },
  { titleKey: 'landing.questionnaires.features.responses', descriptionKey: 'landing.questionnaires.features.responsesDesc' },
  { titleKey: 'landing.questionnaires.features.analysis', descriptionKey: 'landing.questionnaires.features.analysisDesc' },
  { titleKey: 'landing.questionnaires.features.sharing', descriptionKey: 'landing.questionnaires.features.sharingDesc' },
  { titleKey: 'landing.questionnaires.features.privacy', descriptionKey: 'landing.questionnaires.features.privacyDesc' },
] as const;

/**
 * Dedicated landing page for the Questionnaires service.
 * Shows hero, feature grid, and CTA section.
 */
const QuestionnairesLandingPage = (): React.ReactElement => {
  return (
    <LandingLayout>
      <SEOHead
        description={FM('landing.questionnaires.seoDescription')}
        title={FM('landing.questionnaires.seoTitle')}
        url="https://app.menuflow.com/questionnaires"
      />
      <HeroSection
        ctaHintKey="landing.questionnaires.heroCtaHint"
        ctaRoute="/(auth)/login"
        ctaTextKey="landing.questionnaires.heroCta"
        subtitleKey="landing.questionnaires.heroSubtitle"
        titleKey="landing.questionnaires.heroTitle"
      />
      <FeatureGrid
        features={QUESTIONNAIRE_FEATURES}
        sectionTitleKey="landing.questionnaires.features.title"
      />
      <CTASection
        ctaHintKey="landing.questionnaires.cta.buttonHint"
        ctaRoute="/(auth)/login"
        ctaTextKey="landing.questionnaires.cta.button"
        subtitleKey="landing.questionnaires.cta.subtitle"
        titleKey="landing.questionnaires.cta.title"
      />
    </LandingLayout>
  );
};

export default QuestionnairesLandingPage;
