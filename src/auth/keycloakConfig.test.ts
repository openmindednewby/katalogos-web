describe('keycloakConfig', () => {
  afterEach(() => {
    jest.resetModules();
  });

  it('builds config from environment values', () => {
    jest.doMock('../config/environment', () => ({
      __esModule: true,
      default: {
        KEYCLOAK_ISSUER: 'https://issuer',
        KEYCLOAK_CLIENT_ID: 'client',
        KEYCLOAK_REDIRECT_URI: 'https://app/callback',
        KEYCLOAK_SCOPES: 'openid profile email',
      },
    }));

     
    const { keycloakConfig } = require('./keycloakConfig');
    expect(keycloakConfig).toEqual({
      issuer: 'https://issuer',
      clientId: 'client',
      redirectUri: 'https://app/callback',
      scopes: ['openid', 'profile', 'email'],
    });
  });
});

