/**
 * Component Library Showcase Page.
 * Interactive reference of all shared reusable components.
 * Web-only; renders a fallback message on native platforms.
 */
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { Platform } from 'react-native';

import { FM } from '@/localization/helpers';

import ButtonsSection from './sections/ButtonsSection';
import DataDisplaySection from './sections/DataDisplaySection';
import FeedbackSection from './sections/FeedbackSection';
import IconsBrandingSection from './sections/IconsBrandingSection';
import InputsSection from './sections/InputsSection';
import LayoutSection from './sections/LayoutSection';
import { injectShowcaseComponentStyles } from './styles';

const FALLBACK_PADDING = 20;

const ComponentShowcasePage = (): ReactElement => {
  useEffect(() => {
    if (Platform.OS === 'web') injectShowcaseComponentStyles();
  }, []);

  if (Platform.OS !== 'web')
    return (
      <div style={{ padding: FALLBACK_PADDING }}>
        <p>{FM('showcase.webOnly')}</p>
      </div>
    );

  return (
    <div data-testid="component-showcase-page">
      <h1>{FM('showcase.componentLibraryTitle')}</h1>
      <p className="showcase-page__desc">
        {FM('showcase.componentLibraryDescription')}
      </p>

      <h2>{FM('showcase.sectionLayout')}</h2>
      <LayoutSection />

      <h2>{FM('showcase.sectionInputs')}</h2>
      <InputsSection />

      <h2>{FM('showcase.sectionButtons')}</h2>
      <ButtonsSection />

      <h2>{FM('showcase.sectionFeedback')}</h2>
      <FeedbackSection />

      <h2>{FM('showcase.sectionDataDisplay')}</h2>
      <DataDisplaySection />

      <h2>{FM('showcase.sectionIconsBranding')}</h2>
      <IconsBrandingSection />
    </div>
  );
};

export default ComponentShowcasePage;
