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
    // @dloizides/auth-web is consumed from its TypeScript source. It must
    // resolve `@dloizides/auth-client` to THIS app's single copy — not the one
    // nested under the symlinked package's own node_modules — so the shared
    // BffAuthClient / BffUser types are one identity (see metro.config.js for
    // the bundler equivalent).
    '^@dloizides/auth-client$': '<rootDir>/node_modules/@dloizides/auth-client',
    '^@dloizides/auth-web$': '<rootDir>/../../NpmPackages/packages/auth-web/src/index.ts',
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
