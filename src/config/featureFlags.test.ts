 

/**
 * Tests for feature flag defaults and environment variable overrides.
 * Focuses on logic: flag resolution priority (env var > config > default).
 */

describe('featureFlags', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  it('enables enableThemeEditor by default', () => {
    const { featureFlags } = require('./featureFlags') as { featureFlags: { enableThemeEditor: boolean } };
    expect(featureFlags.enableThemeEditor).toBe(true);
  });

  it('enables enableInstallPrompt by default', () => {
    const { featureFlags } = require('./featureFlags') as { featureFlags: { enableInstallPrompt: boolean } };
    expect(featureFlags.enableInstallPrompt).toBe(true);
  });

  it('disables enableThemeEditor when env var is false', () => {
    process.env.EXPO_PUBLIC_ENABLE_THEME_EDITOR = 'false';
    const { featureFlags } = require('./featureFlags') as { featureFlags: { enableThemeEditor: boolean } };
    expect(featureFlags.enableThemeEditor).toBe(false);
  });

  it('disables enableInstallPrompt when env var is false', () => {
    process.env.EXPO_PUBLIC_ENABLE_INSTALL_PROMPT = 'false';
    const { featureFlags } = require('./featureFlags') as { featureFlags: { enableInstallPrompt: boolean } };
    expect(featureFlags.enableInstallPrompt).toBe(false);
  });

  it('enables enableThemeEditor when env var is true', () => {
    process.env.EXPO_PUBLIC_ENABLE_THEME_EDITOR = 'true';
    const { featureFlags } = require('./featureFlags') as { featureFlags: { enableThemeEditor: boolean } };
    expect(featureFlags.enableThemeEditor).toBe(true);
  });

  it('enables enableInstallPrompt when env var is 1', () => {
    process.env.EXPO_PUBLIC_ENABLE_INSTALL_PROMPT = '1';
    const { featureFlags } = require('./featureFlags') as { featureFlags: { enableInstallPrompt: boolean } };
    expect(featureFlags.enableInstallPrompt).toBe(true);
  });

  it('includes enableThemeEditor in isModuleEnabled check', () => {
    const { isModuleEnabled } = require('./featureFlags') as { isModuleEnabled: (key: string) => boolean };
    expect(isModuleEnabled('enableThemeEditor')).toBe(true);
  });

  it('includes enableInstallPrompt in isModuleEnabled check', () => {
    const { isModuleEnabled } = require('./featureFlags') as { isModuleEnabled: (key: string) => boolean };
    expect(isModuleEnabled('enableInstallPrompt')).toBe(true);
  });
});
