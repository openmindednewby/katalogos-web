/* eslint-disable no-console */
/**
 * Demo newsletter form with inline layout using native HTML elements.
 * No Syncfusion dependencies.
 *
 * Note: This is a web-only component using native HTML,
 * so React Native linting rules are disabled.
 */
import type { ReactElement } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FM } from '@/localization/helpers';

import { newsletterSchema } from './schema';
import { FormNativeInput } from '../../../../../../components/ui/form-fields';
import { ButtonNative } from '../../../../../../components/ui/native/ButtonNative';


import type { NewsletterFormData } from './schema';

export const NewsletterForm = (): ReactElement => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    reset,
  } = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: '',
    },
  });

  function handleFormSubmit(data: NewsletterFormData): void {
    // Demo: log form data
    console.log('Newsletter form submitted:', data);
    // eslint-disable-next-line no-alert
    alert(`Subscribed!\nEmail: ${data.email}`);
    reset();
  }

  return (
    <div className="form-card">
      <h2 className="form-card__title">{FM('showcase.newsletter')}</h2>
      <p className="form-card__description">{FM('showcase.subscribeSubtitle')}</p>
      <form className="form-inline" onSubmit={handleSubmit(handleFormSubmit)}>
        <FormNativeInput
          autoComplete="email"
          control={control}
          name="email"
          placeholder={FM('showcase.form.newsletterEmailPlaceholder')}
          testID="showcase-newsletter-email"
          type="email"
        />
        <ButtonNative
          loading={isSubmitting}
          testID="showcase-newsletter-submit"
          type="submit"
        >
          {FM('showcase.subscribe')}
        </ButtonNative>
      </form>
    </div>
  );
}
