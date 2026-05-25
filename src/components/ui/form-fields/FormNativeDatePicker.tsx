/**
 * Native HTML date input wrapped with React Hook Form Controller.
 * Consumes useTheme() via useFormThemeVars() for per-tenant styling.
 * No Syncfusion dependencies.
 */
import type { ReactElement } from 'react';

import { Controller } from 'react-hook-form';

import { useFormThemeVars } from './useFormThemeVars';
import { isValueDefined } from '../../../shared/utils/validators';

import type { NativeInputProps } from './types';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface Props<T extends FieldValues> extends Omit<NativeInputProps, 'name' | 'value' | 'onChange' | 'type'> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  min?: string;
  max?: string;
  testID?: string;
}

export const FormNativeDatePicker = <T extends FieldValues>({
  name,
  control,
  label,
  min,
  max,
  testID,
  disabled,
  ...rest
}: Props<T>): ReactElement => {
  const { style: themeVars } = useFormThemeVars();

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
            <input
              {...rest}
              ref={field.ref}
              aria-describedby={showError ? errorId : undefined}
              aria-invalid={showError}
              className={inputClassName}
              data-testid={testID}
              disabled={disabled}
              id={name}
              max={max}
              min={min}
              name={field.name}
              type="date"
              value={String(field.value ?? '')}
              onBlur={field.onBlur}
              onChange={field.onChange}
            />
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
