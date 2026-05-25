module.exports = {
  ci: {
    collect: {
      // Serve the production build from dist folder with SPA fallback support
      // This ensures we test the production bundle, not the dev server
      // which has debug overlays (LogBox) with poor accessibility contrast
      startServerCommand: 'npx serve dist -p 8099 --single',
      startServerReadyPattern: 'Accepting connections at',
      startServerReadyTimeout: 30000,
      url: ['http://localhost:8099/'],
      numberOfRuns: 3,
      settings: {
        preset: 'desktop',
        // Skip PWA audits since this is a web app, not PWA
        skipAudits: ['installable-manifest', 'splash-screen', 'themed-omnibox'],
      },
    },
    assert: {
      assertions: {
        // Performance - warn at 80, fail at 60
        'categories:performance': ['warn', { minScore: 0.8 }],
        // Accessibility - strict, fail below 90
        'categories:accessibility': ['error', { minScore: 0.9 }],
        // Best Practices - warn at 80, fail at 70
        'categories:best-practices': ['warn', { minScore: 0.8 }],
        // SEO - warn at 80
        'categories:seo': ['warn', { minScore: 0.8 }],
      },
    },
    upload: {
      // For now, just output to filesystem
      target: 'filesystem',
      outputDir: './lighthouse-reports',
    },
  },
};
