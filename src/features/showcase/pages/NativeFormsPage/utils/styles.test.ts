import { nativeFormStyles } from './styles';

describe('nativeFormStyles', () => {
  it('references theme background variable instead of hardcoded white', () => {
    expect(nativeFormStyles).toContain('--form-background: rgb(var(--color-background');
    expect(nativeFormStyles).not.toContain('--form-background: #ffffff');
  });

  it('references theme surface variable instead of hardcoded gray', () => {
    expect(nativeFormStyles).toContain('--form-surface: rgb(var(--color-surface');
    expect(nativeFormStyles).not.toContain('--form-surface: #f7f7f7');
  });

  it('references theme border variable instead of hardcoded color', () => {
    expect(nativeFormStyles).toContain('--form-border: rgb(var(--color-border');
    expect(nativeFormStyles).not.toContain('--form-border: #e0e0e0');
  });

  it('references theme error variable instead of hardcoded red', () => {
    expect(nativeFormStyles).toContain('--form-error: rgb(var(--color-error-500');
    expect(nativeFormStyles).not.toContain('--form-error: #dc2626');
  });

  it('references theme primary variable instead of hardcoded green', () => {
    expect(nativeFormStyles).toContain('--form-primary: rgb(var(--color-primary-500');
    expect(nativeFormStyles).not.toContain('--form-primary: #008d5c');
  });

  it('references theme text variable instead of hardcoded dark color', () => {
    expect(nativeFormStyles).toContain('--form-text: rgb(var(--color-text-primary');
    expect(nativeFormStyles).not.toContain('--form-text: #1a1a1a');
  });

  it('references theme text-secondary variable instead of hardcoded gray', () => {
    expect(nativeFormStyles).toContain('--form-text-secondary: rgb(var(--color-text-secondary');
    expect(nativeFormStyles).not.toContain('--form-text-secondary: #666666');
  });

  it('uses theme variable for button text color instead of hardcoded white', () => {
    expect(nativeFormStyles).toContain('color: var(--form-text-on-primary)');
    expect(nativeFormStyles).not.toMatch(/\.btn-native--primary\s*\{[^}]*color:\s*#ffffff/);
  });

  it('uses theme primary color with alpha for focus ring', () => {
    expect(nativeFormStyles).toContain('rgb(var(--color-primary-500');
    expect(nativeFormStyles).not.toContain('rgba(0, 141, 92');
  });

  it('uses theme error color with alpha for error focus ring', () => {
    expect(nativeFormStyles).toContain('rgb(var(--color-error-500');
    expect(nativeFormStyles).not.toContain('rgba(220, 38, 38');
  });

  it('uses theme primary color with alpha for combobox active option', () => {
    expect(nativeFormStyles).toContain(
      'rgb(var(--color-primary-500, 59 130 246) / 0.15)'
    );
    expect(nativeFormStyles).not.toContain('#e0e7ff');
  });

  it('contains no hardcoded hex color values', () => {
    const hexColorPattern = /:\s*#[0-9a-fA-F]{3,8}\s*[;,)]/g;
    const matches = nativeFormStyles.match(hexColorPattern);
    expect(matches).toBeNull();
  });

  it('defines --form-text-on-primary for contrast text on primary backgrounds', () => {
    expect(nativeFormStyles).toContain('--form-text-on-primary: rgb(var(--color-text-inverse');
  });

  it('references theme radius variable', () => {
    expect(nativeFormStyles).toContain('--form-radius: var(--radius-lg');
  });

  it('references theme spacing variable', () => {
    expect(nativeFormStyles).toContain('--form-spacing: var(--space-4');
  });
});
