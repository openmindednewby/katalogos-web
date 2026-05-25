/* eslint-disable no-console */
/**
 * Demo contact form using native HTML elements.
 * No Syncfusion dependencies.
 *
 * Note: This is a web-only component using native HTML,
 * so React Native linting rules are disabled.
 */
import type { ReactElement } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FM } from '@/localization/helpers';

import { contactSchema, subjectOptions } from './schema';
import {
  FormNativeInput,
  FormNativeSelect,
  FormNativeTextarea,
} from '../../../../../../components/ui/form-fields';
import { ButtonNative } from '../../../../../../components/ui/native/ButtonNative';


import type { ContactFormData } from './schema';

export const ContactForm = (): ReactElement => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  function handleFormSubmit(data: ContactFormData): void {
    // Demo: log form data
    console.log('Contact form submitted:', data);
    // eslint-disable-next-line no-alert
    alert(`Message sent!\nSubject: ${data.subject}\nFrom: ${data.name}`);
  }

  return (
    <div className="form-card">
      <h2 className="form-card__title">{FM('showcase.contactUs')}</h2>
      <p className="form-card__description">{FM('showcase.sendMessage')}</p>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <FormNativeInput
          autoComplete="name"
          control={control}
          label={FM('showcase.form.contactNameLabel')}
          name="name"
          placeholder={FM('showcase.form.contactNamePlaceholder')}
          testID="showcase-contact-name"
          type="text"
        />
        <FormNativeInput
          autoComplete="email"
          control={control}
          label={FM('showcase.form.contactEmailLabel')}
          name="email"
          placeholder={FM('showcase.form.contactEmailPlaceholder')}
          testID="showcase-contact-email"
          type="email"
        />
        <FormNativeSelect
          control={control}
          label={FM('showcase.form.contactSubjectLabel')}
          name="subject"
          options={subjectOptions}
          placeholder={FM('showcase.form.contactSubjectPlaceholder')}
          testID="showcase-contact-subject"
        />
        <FormNativeTextarea
          control={control}
          label={FM('showcase.form.contactMessageLabel')}
          name="message"
          placeholder={FM('showcase.form.contactMessagePlaceholder')}
          rows={4}
          testID="showcase-contact-message"
        />
        <ButtonNative
          fullWidth
          loading={isSubmitting}
          testID="showcase-contact-submit"
          type="submit"
        >
          {FM('showcase.sendMessageButton')}
        </ButtonNative>
      </form>
    </div>
  );
}
