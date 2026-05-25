/**
 * Native HTML checkbox wrapped with React Hook Form Controller.
 * Consumes useTheme() via useFormThemeVars() for per-tenant styling.
 * No Syncfusion dependencies.
 */
import type { ReactElement } from 'react';

import { Controller } from 'react-hook-form';

import { useFormThemeVars } from './useFormThemeVars';
import { isValueDefined } from '../../../shared/utils/validators';

import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface Props<T extends FieldValues> {
  name: FieldPath<T>;
  control: Control<T>;
  label: string;
  testID?: string;
  disabled?: boolean;
}

export const FormNativeCheckbox = <T extends FieldValues>({
  name,
  control,
  label,
  testID,
  disabled,
}: Props<T>): ReactElement => {
  const { style: themeVars } = useFormThemeVars();

  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState, formState }) => {
        const showError = (fieldState.isTouched || formState.isSubmitted) && isValueDefined(fieldState.error);
        const errorId = `${name}-error`;

        return (
          <div className="form-native-field form-native-field--checkbox" style={themeVars}>
            <label className="form-native-checkbox-label" htmlFor={name}>
              <input
                ref={field.ref}
                aria-describedby={showError ? errorId : undefined}
                aria-invalid={showError}
                checked={Boolean(field.value)}
                className="form-native-checkbox"
                data-testid={testID}
                disabled={disabled}
                id={name}
                name={field.name}
                type="checkbox"
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(e.target.checked)}
              />
              <span className="form-native-checkbox-text">{label}</span>
            </label>
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
