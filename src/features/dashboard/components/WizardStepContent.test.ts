/**
 * Tests for the realm-key resolver used by Step1Content to pick between
 * questioner-flavored and onlinemenu-flavored copy. We mock @/auth/keycloakConfig
 * per test by re-importing in `jest.isolateModules`.
 */

describe('resolveWizardRealmKey', () => {
  beforeEach(() => {
    jest.resetModules();
  });

  function loadResolver(realm: string | null): () => 'questioner' | 'onlinemenu' {
    jest.doMock('@/auth/keycloakConfig', () => ({ keycloakRealm: realm }));
    // Mock the heavy transitive deps so the file imports cleanly in Jest.
    jest.doMock('@/components/Content/components/ImagePicker', () => ({ ImagePicker: () => null }));
    jest.doMock('@/components/Dashboard/components/wizardContentStyles', () => ({
      DISABLED_OPACITY: 0.5,
      FULL_OPACITY: 1,
      INPUT_MARGIN_TOP: 0,
      wizardContentStyles: {},
    }));
    jest.doMock('@/features/onlinemenus/components/TemplateGallery/TemplateGallery', () => ({ default: () => null }));
    jest.doMock('@/features/onlinemenus/hooks/useMenuTemplates', () => ({ useMenuTemplates: () => ({ templates: [], isLoading: false }) }));
     
    const mod = require('./WizardStepContent') as { resolveWizardRealmKey: () => 'questioner' | 'onlinemenu' };
    return mod.resolveWizardRealmKey;
  }

  it('returns "questioner" when realm is questioner', () => {
    const resolve = loadResolver('questioner');
    expect(resolve()).toBe('questioner');
  });

  it('returns "onlinemenu" when realm is onlinemenu', () => {
    const resolve = loadResolver('onlinemenu');
    expect(resolve()).toBe('onlinemenu');
  });

  it('falls back to "onlinemenu" when realm is null', () => {
    const resolve = loadResolver(null);
    expect(resolve()).toBe('onlinemenu');
  });

  it('falls back to "onlinemenu" when realm is an unknown value', () => {
    const resolve = loadResolver('master');
    expect(resolve()).toBe('onlinemenu');
  });
});
