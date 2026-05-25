 
/**
 * Native Forms Showcase Page.
 * Demonstrates native HTML form elements styled with CSS variables.
 * No Syncfusion dependencies - lightweight bundle for pages like login.
 *
 * Note: This is a web-only page that uses native HTML elements,
 * so React Native linting rules are disabled.
 */
import type { ReactElement } from 'react';
import { useEffect } from 'react';

import { Platform } from 'react-native';

import { FM } from '@/localization/helpers';

import { ContactForm } from './forms/ContactForm';
import { LoginForm } from './forms/LoginForm';
import { NewsletterForm } from './forms/NewsletterForm';
import { RegistrationForm } from './forms/RegistrationForm';
import { injectNativeFormStyles } from './utils/styles';

const FALLBACK_PADDING = 20;

export const NativeFormsPage = (): ReactElement => {
  useEffect(() => {
    // Inject styles on web platform
    if (Platform.OS === 'web') injectNativeFormStyles();
  }, []);

  // This page is web-only since it uses native HTML elements
  if (Platform.OS !== 'web')
    return (
      <div style={{ padding: FALLBACK_PADDING }}>
        <p>{FM('showcase.webOnly')}</p>
      </div>
    );

  return (
    <div className="showcase-page" data-testid="native-forms-page">
      <h1 className="showcase-page__title">{FM('showcase.nativeFormsTitle')}</h1>
      <p className="showcase-page__description">
        {FM('showcase.nativeFormsDescription')}
      </p>
      <div className="showcase-grid">
        <LoginForm />
        <RegistrationForm />
        <ContactForm />
        <NewsletterForm />
      </div>
    </div>
  );
}

export default NativeFormsPage;
