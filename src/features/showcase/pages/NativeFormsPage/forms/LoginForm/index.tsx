/* eslint-disable no-console */
/**
 * Demo login form using native HTML elements.
 * No Syncfusion dependencies.
 *
 * Note: This is a web-only component using native HTML,
 * so React Native linting rules are disabled.
 */
import type { ReactElement } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { FM } from '@/localization/helpers';

import { loginSchema } from './schema';
import {
  FormNativeCheckbox,
  FormNativeInput,
  FormPasswordInput,
} from '../../../../../../components/ui/form-fields';
import { ButtonNative } from '../../../../../../components/ui/native/ButtonNative';


import type { LoginFormData } from './schema';
import type { z } from 'zod';

/** Input type before Zod transforms (rememberMe is optional) */
type LoginFormInput = z.input<typeof loginSchema>;

export const LoginForm = (): ReactElement => {
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginFormInput, unknown, LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  function handleFormSubmit(data: LoginFormData): void {
    // Demo: log form data
    console.log('Login form submitted:', data);
    // eslint-disable-next-line no-alert
    alert(`Login submitted!\nEmail: ${data.email}\nRemember Me: ${String(data.rememberMe)}`);
  }

  return (
    <div className="form-card">
      <h2 className="form-card__title">{FM('showcase.loginTitle')}</h2>
      <p className="form-card__description">{FM('showcase.loginSubtitle')}</p>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <FormNativeInput
          autoComplete="email"
          control={control}
          label={FM('showcase.form.emailLabel')}
          name="email"
          placeholder={FM('showcase.form.loginEmailPlaceholder')}
          testID="showcase-login-email"
          type="email"
        />
        <FormPasswordInput
          autoComplete="current-password"
          control={control}
          label={FM('showcase.form.loginPasswordLabel')}
          name="password"
          placeholder={FM('showcase.form.loginPasswordPlaceholder')}
          testID="showcase-login-password"
        />
        <FormNativeCheckbox
          control={control}
          label={FM('showcase.form.rememberMeLabel')}
          name="rememberMe"
          testID="showcase-login-remember"
        />
        <ButtonNative
          fullWidth
          loading={isSubmitting}
          testID="showcase-login-submit"
          type="submit"
        >
          {FM('showcase.signIn')}
        </ButtonNative>
      </form>
    </div>
  );
}
