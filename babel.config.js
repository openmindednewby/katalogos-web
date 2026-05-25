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
  };
};
