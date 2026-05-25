/**
 * Native HTML textarea wrapped with React Hook Form Controller.
 * Consumes useTheme() via useFormThemeVars() for per-tenant styling.
 * No Syncfusion dependencies.
 */
import type { ReactElement } from 'react';

import { Controller } from 'react-hook-form';

import { useFormThemeVars } from './useFormThemeVars';
import { isValueDefined } from '../../../shared/utils/validators';

import type { NativeTextareaProps } from './types';
import type { Control, FieldPath, FieldValues } from 'react-hook-form';

interface Props<T extends FieldValues> extends Omit<NativeTextareaProps, 'name' | 'value' | 'onChange'> {
  name: FieldPath<T>;
  control: Control<T>;
  label?: string;
  placeholder?: string;
  rows?: number;
  testID?: string;
}

const DEFAULT_ROWS = 4;

export const FormNativeTextarea = <T extends FieldValues>({
  name,
  control,
  label,
  placeholder,
  rows = DEFAULT_ROWS,
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
        const textareaClassName = showError ? 'form-native-textarea has-error' : 'form-native-textarea';
        const errorId = `${name}-error`;

        return (
          <div className="form-native-field" style={themeVars}>
            {isValueDefined(label) && label !== '' ? (
              <label className="form-native-label" htmlFor={name}>
                {label}
              </label>
            ) : null}
            <textarea
              {...rest}
              ref={field.ref}
              aria-describedby={showError ? errorId : undefined}
              aria-invalid={showError}
              className={textareaClassName}
              data-testid={testID}
              disabled={disabled}
              id={name}
              name={field.name}
              placeholder={placeholder}
              rows={rows}
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
