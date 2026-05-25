/**
 * CSS styles for native form base elements: CSS variables, field containers,
 * labels, text inputs, selects, and select-specific styles.
 * Split from styles.ts to keep file sizes under 200 lines.
 */

import { nativeFormControlStyles } from './controlStyles';

export const nativeFormBaseInputStyles = `
/* CSS Variables for theming - references SyncfusionThemeStudio CSS vars */
/* Mode vars (--color-background etc.) use RGB triplets, e.g. '255 255 255' */
/* Component vars (--component-input-*) are injected as full rgb() values  */
:root {
  --form-background: rgb(var(--color-background, 255 255 255));
  --form-surface: rgb(var(--color-surface, 249 250 251));
  --form-border: rgb(var(--color-border, 229 231 235));
  --form-border-focus: rgb(var(--color-primary-500, 59 130 246));
  --form-text: rgb(var(--color-text-primary, 17 24 39));
  --form-text-secondary: rgb(var(--color-text-secondary, 107 114 128));
  --form-error: rgb(var(--color-error-500, 239 68 68));
  --form-primary: rgb(var(--color-primary-500, 59 130 246));
  --form-primary-hover: rgb(var(--color-primary-700, 29 78 216));
  --form-secondary: rgb(var(--color-text-secondary, 107 114 128));
  --form-secondary-hover: rgb(var(--color-border, 229 231 235));
  --form-disabled: rgb(var(--color-text-muted, 107 114 128));
  --form-radius: var(--radius-lg, 0.5rem);
  --form-spacing: var(--space-4, 16px);
  --form-text-on-primary: rgb(var(--color-text-inverse, 255 255 255));
}

/* Field container */
.form-native-field {
  margin-bottom: var(--form-spacing);
  width: 100%;
}

.form-native-field--checkbox {
  margin-bottom: calc(var(--form-spacing) * 0.75);
}

/* Labels */
.form-native-label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--form-text);
}

/* Input base styles */
.form-native-input,
.form-native-select,
.form-native-textarea {
  width: 100%;
  padding: 12px 14px;
  font-size: 16px;
  line-height: 1.5;
  color: var(--form-text);
  background-color: var(--form-background);
  border: 1px solid var(--form-border);
  border-radius: var(--form-radius);
  transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
  outline: none;
  font-family: inherit;
}

.form-native-input:focus,
.form-native-select:focus,
.form-native-textarea:focus {
  border-color: var(--form-border-focus);
  box-shadow: 0 0 0 3px rgb(var(--color-primary-500, 59 130 246) / 0.15);
}

.form-native-input:disabled,
.form-native-select:disabled,
.form-native-textarea:disabled {
  background-color: var(--form-surface);
  color: var(--form-text-secondary);
  cursor: not-allowed;
}

.form-native-input.has-error,
.form-native-select.has-error,
.form-native-textarea.has-error {
  border-color: var(--form-error);
}

.form-native-input.has-error:focus,
.form-native-select.has-error:focus,
.form-native-textarea.has-error:focus {
  box-shadow: 0 0 0 3px rgb(var(--color-error-500, 239 68 68) / 0.15);
}

.form-native-input::placeholder,
.form-native-textarea::placeholder {
  color: var(--form-text-secondary);
  opacity: 0.7;
}

/* Select specific */
/* Note: SVG data URIs cannot reference CSS variables, so the arrow color uses a
   neutral gray (9ca3af) that meets contrast in both light and dark modes. */
.form-native-select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239ca3af' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 36px;
  cursor: pointer;
}
`;

/** Combined input styles: base inputs + combobox, password, checkbox, textarea, error */
export const nativeFormInputStyles = nativeFormBaseInputStyles + nativeFormControlStyles;
