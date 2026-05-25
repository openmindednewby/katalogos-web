/**
 * CSS styles for native form controls: combobox, password, checkbox, textarea, and error.
 * Split from inputStyles.ts to keep file sizes under 200 lines.
 */

export const nativeFormControlStyles = `
/* Combobox (searchable select) */
.form-native-combobox-wrapper {
  position: relative;
  z-index: 1;
}

.form-native-combobox-input {
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

.form-native-combobox-input:focus {
  border-color: var(--form-border-focus);
  box-shadow: 0 0 0 3px rgb(var(--color-primary-500, 59 130 246) / 0.15);
}

.form-native-combobox-input:disabled {
  background-color: var(--form-surface);
  color: var(--form-text-secondary);
  cursor: not-allowed;
}

.form-native-combobox-input.has-error {
  border-color: var(--form-error);
}

.form-native-combobox-input.has-error:focus {
  box-shadow: 0 0 0 3px rgb(var(--color-error-500, 239 68 68) / 0.15);
}

.form-native-combobox-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  z-index: 10;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid var(--form-border);
  border-radius: 0.375rem;
  background: var(--form-background);
  margin-top: 2px;
  padding: 0;
  list-style: none;
}

.form-native-combobox-option {
  padding: 0.5rem 0.75rem;
  cursor: pointer;
  font-size: 14px;
  color: var(--form-text);
}

.form-native-combobox-option--highlighted {
  background: var(--form-surface);
}

.form-native-combobox-option--active {
  background: rgb(var(--color-primary-500, 59 130 246) / 0.15);
}

.form-native-combobox-no-results {
  padding: 0.5rem 0.75rem;
  color: var(--form-text-secondary);
  font-style: italic;
  font-size: 14px;
}

/* Textarea specific */
.form-native-textarea {
  resize: vertical;
  min-height: 100px;
}

/* Password wrapper */
.form-native-password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.form-native-password-wrapper .form-native-input {
  padding-right: 44px;
}

.form-native-password-toggle {
  position: absolute;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--form-text-secondary);
  border-radius: 4px;
  transition: color 0.15s ease-in-out, background-color 0.15s ease-in-out;
}

.form-native-password-toggle:hover {
  color: var(--form-text);
  background-color: var(--form-surface);
}

.form-native-password-toggle:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Checkbox */
.form-native-checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--form-text);
}

.form-native-checkbox {
  width: 18px;
  height: 18px;
  margin: 0;
  cursor: pointer;
  accent-color: var(--form-primary);
}

.form-native-checkbox:disabled {
  cursor: not-allowed;
}

.form-native-checkbox-text {
  user-select: none;
}

/* Error message */
.form-native-error {
  display: block;
  margin-top: 4px;
  font-size: 12px;
  color: var(--form-error);
}
`;
