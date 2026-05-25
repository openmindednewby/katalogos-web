/**
 * CSS styles for native form buttons, cards, and page layout.
 * Split from styles.ts to keep file sizes under 200 lines.
 */

export const nativeFormButtonStyles = `
/* Native Button */
.btn-native {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  text-decoration: none;
  border-radius: var(--form-radius);
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease-in-out, border-color 0.15s ease-in-out, color 0.15s ease-in-out;
  font-family: inherit;
}

.btn-native:disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.btn-native--primary {
  background-color: var(--form-primary);
  color: var(--form-text-on-primary);
}

.btn-native--primary:hover:not(:disabled) {
  background-color: var(--form-primary-hover);
}

.btn-native--secondary {
  background-color: var(--form-secondary);
  color: var(--form-text-on-primary);
}

.btn-native--secondary:hover:not(:disabled) {
  background-color: var(--form-secondary-hover);
}

.btn-native--outline {
  background-color: transparent;
  border-color: var(--form-border);
  color: var(--form-text);
}

.btn-native--outline:hover:not(:disabled) {
  background-color: var(--form-surface);
  border-color: var(--form-text-secondary);
}

.btn-native--full-width {
  width: 100%;
}

.btn-native--loading {
  pointer-events: none;
}

.btn-native__spinner {
  position: absolute;
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: btn-spin 0.8s linear infinite;
}

.btn-native__content {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.btn-native__content--hidden {
  visibility: hidden;
}

@keyframes btn-spin {
  to {
    transform: rotate(360deg);
  }
}
`;

export const nativeFormLayoutStyles = `
/* Form Card */
.form-card {
  background-color: var(--form-background);
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 0.1), 0 1px 2px rgb(0 0 0 / 0.06);
  max-width: 400px;
  width: 100%;
}

.form-card__title {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: var(--form-text);
}

.form-card__description {
  margin: 0 0 24px 0;
  font-size: 14px;
  color: var(--form-text-secondary);
}

/* Newsletter form inline */
.form-inline {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.form-inline .form-native-field {
  flex: 1;
  margin-bottom: 0;
}

.form-inline .btn-native {
  flex-shrink: 0;
}

/* Showcase page layout */
.showcase-page {
  min-height: 100vh;
  padding: 32px;
  background-color: var(--form-surface);
}

.showcase-page__title {
  margin: 0 0 8px 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--form-text);
}

.showcase-page__description {
  margin: 0 0 32px 0;
  font-size: 16px;
  color: var(--form-text-secondary);
  max-width: 600px;
}

.showcase-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
  max-width: 1200px;
}

@media (max-width: 480px) {
  .showcase-page {
    padding: 16px;
  }

  .showcase-grid {
    grid-template-columns: 1fr;
  }

  .form-card {
    padding: 16px;
  }

  .form-inline {
    flex-direction: column;
  }

  .form-inline .btn-native {
    width: 100%;
  }
}
`;
