/**
 * Babel configuration for Expo/React Native project.
 */
module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Resolve @/ alias to src/ directory for Metro bundler
      // Must run before other transforms so imports are resolved first
      ['module-resolver', { alias: { '@': './src' } }],
      // Transform import.meta.env to process.env for Metro compatibility
      // This fixes issues with libraries like zustand that use import.meta.env
      'babel-plugin-transform-import-meta',
    ],
    overrides: [
      {
        // Give every `const enum` a guaranteed runtime object representation
        // (a plain `const {...}` object literal). babel-preset-expo (Metro)
        // transforms files independently with no whole-program const-enum
        // inliner, so a cross-file const-enum VALUE read evaluated at MODULE
        // LOAD can resolve to `undefined` under the prod web minify/tree-shake
        // stage (this crashed kefi-web `/login`). `constObject` mode makes
        // cross-file value reads always safe and keeps the repo's
        // "use const enum" rule valid.
        //
        // Scoped to our own .ts/.tsx source: the plugin forces TypeScript
        // syntax parsing, which breaks JSX inside compiled `.js` files in
        // node_modules (e.g. expo-router's qualified-entry.js) if applied
        // globally. See BaseClient/docs/code-standards/frontend-react.md.
        test: /\.tsx?$/,
        plugins: [['babel-plugin-const-enum', { transform: 'constObject' }]],
      },
    ],
  };
};
