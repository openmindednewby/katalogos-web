/* eslint-disable no-console */
/**
 * Demo registration form using native HTML elements.
 * No Syncfusion dependencies.
 *
 * Note: This is a web-only component using native HTML,
 * so React Native linting rules are disabled.
 */
import type { ReactElement } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FM } from '@/localization/helpers';

import { registrationSchema } from './schema';
import {
  FormNativeInput,
  FormPasswordInput,
} from '../../../../../../components/ui/form-fields';
import { ButtonNative } from '../../../../../../components/ui/native/ButtonNative';


import type { RegistrationFormData } from './schema';

export const RegistrationForm = (): ReactElement => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  function handleFormSubmit(data: RegistrationFormData): void {
    // Demo: log form data
    console.log('Registration form submitted:', data);
    // eslint-disable-next-line no-alert
    alert(`Registration submitted!\nName: ${data.name}\nEmail: ${data.email}`);
  }

  return (
    <div className="form-card">
      <h2 className="form-card__title">{FM('showcase.createAccount')}</h2>
      <p className="form-card__description">{FM('showcase.registerSubtitle')}</p>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <FormNativeInput
          autoComplete="name"
          control={control}
          label={FM('showcase.form.fullNameLabel')}
          name="name"
          placeholder={FM('showcase.form.fullNamePlaceholder')}
          testID="showcase-register-name"
          type="text"
        />
        <FormNativeInput
          autoComplete="email"
          control={control}
          label={FM('showcase.form.emailLabel')}
          name="email"
          placeholder={FM('showcase.form.emailPlaceholder')}
          testID="showcase-register-email"
          type="email"
        />
        <FormPasswordInput
          autoComplete="new-password"
          control={control}
          label={FM('showcase.form.passwordLabel')}
          name="password"
          placeholder={FM('showcase.form.passwordPlaceholder')}
          testID="showcase-register-password"
        />
        <FormPasswordInput
          autoComplete="new-password"
          control={control}
          label={FM('showcase.form.confirmPasswordLabel')}
          name="confirmPassword"
          placeholder={FM('showcase.form.confirmPasswordPlaceholder')}
          testID="showcase-register-confirm-password"
        />
        <ButtonNative
          fullWidth
          loading={isSubmitting}
          testID="showcase-register-submit"
          type="submit"
        >
          {FM('showcase.createAccount')}
        </ButtonNative>
      </form>
    </div>
  );
}
