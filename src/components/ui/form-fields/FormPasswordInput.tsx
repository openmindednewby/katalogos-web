/**
 * Native password input with visibility toggle.
 * Consumes useTheme() via useFormThemeVars() for per-tenant styling.
 * No Syncfusion dependencies.
 */
import type { ReactElement } from 'react';
import { useState } from 'react';

import { Controller } from 'react-hook-form';

import { useFormThemeVars } from './useFormThemeVars';
import { isValueDefined } from '../../../shared/utils/validators';

import type { NativeInputProps } from './types';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface Props<T extends FieldValues> extends Omit<NativeInputProps, 'name' | 'value' | 'onChange' | 'type'> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  autoComplete?: string;
  testID?: string;
}

export const FormPasswordInput = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  autoComplete = 'current-password',
  testID,
  disabled,
  ...rest
}: Props<T>): ReactElement => {
  const [showPassword, setShowPassword] = useState(false);
  const { style: themeVars } = useFormThemeVars();

  function handleToggleVisibility(): void {
    setShowPassword((prev) => !prev);
  }

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState, formState }) => {
        const showError = (fieldState.isTouched || formState.isSubmitted) && isValueDefined(fieldState.error);
        const inputClassName = showError ? 'form-native-input has-error' : 'form-native-input';
        const errorId = `${name}-error`;

        return (
          <div className="form-native-field" style={themeVars}>
            {isValueDefined(label) && label !== '' ? (
              <label className="form-native-label" htmlFor={name}>
                {label}
              </label>
            ) : null}
            <div className="form-native-password-wrapper">
              <input
                {...rest}
                ref={field.ref}
                aria-describedby={showError ? errorId : undefined}
                aria-invalid={showError}
                autoComplete={autoComplete}
                className={inputClassName}
                data-testid={testID}
                disabled={disabled}
                id={name}
                name={field.name}
                placeholder={placeholder}
                type={showPassword ? 'text' : 'password'}
                value={String(field.value ?? '')}
                onBlur={field.onBlur}
                onChange={field.onChange}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="form-native-password-toggle"
                data-testid={isValueDefined(testID) ? `${testID}-toggle` : 'password-toggle'}
                disabled={disabled}
                type="button"
                onClick={handleToggleVisibility}
              >
                {showPassword ? (
                  <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" x2="23" y1="1" y2="23" />
                  </svg>
                ) : (
                  <svg fill="none" height="20" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" width="20">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
            {showError ? (
              <span className="form-native-error" id={errorId} role="alert">
                {fieldState.error?.message}
              </span>
            ) : null}
          </div>
        );
      }}
    />
  );
}
