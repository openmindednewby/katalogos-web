/**
 * Jest configuration for React Native + Expo project.
 */
module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)', '**/?(*.)+(spec|test).[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/packages/', '/dist/'],
  watchPathIgnorePatterns: ['/dist/', '/node_modules/', '/.expo/', '/.git/'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-paper|react-native-vector-icons|@tanstack/.*|@reduxjs/.*)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // @dloizides/auth-web resolves from node_modules (the published dist) —
    // the same thing Metro bundles and prod ships. Do NOT map it to the local
    // package source: that couples this app's tests to in-progress package
    // work (and the source's own node_modules/react-native copy isn't set up
    // by jest-expo, so module-level StyleSheet.create crashes). erevna-web
    // resolves the same way.
    // Map @dloizides/notification-client subpath exports to the package's built dist files.
    // Jest's jest-expo resolver does not honor the package.json `exports` map for subpaths,
    // so each subpath needs an explicit mapping. We point at the published .js (CJS) files
    // in node_modules — not the .ts sources — to avoid TypeScript transform issues for files
    // outside the project root.
    '^@dloizides/notification-client$': '<rootDir>/node_modules/@dloizides/notification-client/dist/index.js',
    '^@dloizides/notification-client/react/context$': '<rootDir>/node_modules/@dloizides/notification-client/dist/react/NotificationContext.js',
    '^@dloizides/notification-client/react/hooks$': '<rootDir>/node_modules/@dloizides/notification-client/dist/react/hooks.js',
    '^@dloizides/notification-client/react$': '<rootDir>/node_modules/@dloizides/notification-client/dist/react/index.js',
    '^@dloizides/notification-client/(components|workers|react)$': '<rootDir>/node_modules/@dloizides/notification-client/dist/$1/index.js',
    // ui-buttons / ui-nav / ui-feedback are installed from local tarballs; pin
    // to their built CJS dist (same rationale as notification-client) so the
    // jest-expo resolver never loads their TS source.
    '^@dloizides/ui-feedback$': '<rootDir>/node_modules/@dloizides/ui-feedback/dist/index.js',
    '^@dloizides/ui-buttons$': '<rootDir>/node_modules/@dloizides/ui-buttons/dist/index.js',
    '^@dloizides/ui-nav$': '<rootDir>/node_modules/@dloizides/ui-nav/dist/index.js',
    // Force a single React / react-native (the app's) so the packaged dist
    // bundles share React identity (hooks) and the jest-expo-transformed RN.
    '^react$': '<rootDir>/node_modules/react',
    '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime',
    '^react-native$': '<rootDir>/node_modules/react-native',
  },
  collectCoverageFrom: [
    // Include utilities, hooks, and logic files
    'src/**/*.{ts}',
    'src/utils/**/*.{ts,tsx}',
    'src/lib/**/*.{ts,tsx}',
    'src/hooks/**/*.{ts,tsx}',
    'src/store/**/*.{ts,tsx}',
    'src/auth/**/*.{ts,tsx}',
    'src/shared/**/*.{ts,tsx}',
    // Exclude patterns
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/server/**/*',
    '!src/generated/**/*',
    // Exclude UI components (tested by Playwright E2E)
    '!src/components/**/*',
    // Exclude app routes (tested by Playwright E2E)
    '!src/app/**/*',
  ],
  coverageThreshold: {
    global: {
      branches: 50,
      functions: 50,
      lines: 50,
      statements: 50,
    },
  },
  testEnvironment: 'jsdom',
};
