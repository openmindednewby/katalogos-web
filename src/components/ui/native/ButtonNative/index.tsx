/**
 * Native HTML button styled with CSS variables.
 * Supports primary, secondary, and outline variants.
 * No Syncfusion dependencies.
 */
import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react';

const enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Outline = 'outline',
}

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  loading?: boolean;
  fullWidth?: boolean;
  testID?: string;
}

export const ButtonNative = ({
  children,
  variant = ButtonVariant.Primary,
  loading = false,
  fullWidth = false,
  disabled,
  className,
  testID,
  ...rest
}: Props): ReactElement => {
  const baseClass = 'btn-native';
  const variantClass = `btn-native--${variant}`;
  const widthClass = fullWidth ? 'btn-native--full-width' : '';
  const loadingClass = loading ? 'btn-native--loading' : '';
  const combinedClassName = [baseClass, variantClass, widthClass, loadingClass, className]
    .filter(Boolean)
    .join(' ');
  const isDisabled = disabled === true || loading;

  return (
    <button
      {...rest}
      aria-busy={loading}
      aria-disabled={isDisabled}
      className={combinedClassName}
      data-testid={testID}
      disabled={isDisabled}
    >
      {loading ? (
        <span aria-hidden="true" className="btn-native__spinner" />
      ) : null}
      <span className={loading ? 'btn-native__content--hidden' : 'btn-native__content'}>
        {children}
      </span>
    </button>
  );
}
