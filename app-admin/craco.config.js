// craco.config.js
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Remove the existing ForkTsCheckerWebpackPlugin and ESLintPlugin
      webpackConfig.plugins = webpackConfig.plugins.filter(
        plugin => {
          const pluginName = plugin.constructor.name;
          return pluginName !== 'ForkTsCheckerWebpackPlugin' &&
                 pluginName !== 'ESLintWebpackPlugin';
        }
      );

      // Disable source maps in development to save memory
      if (env === 'development') {
        webpackConfig.devtool = false;
      }

      // Optimize webpack config for memory
      webpackConfig.optimization = {
        ...webpackConfig.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };

      return webpackConfig;
    },
  },
  eslint: {
    enable: false, // Completely disable ESLint
  },
  typescript: {
    enableTypeChecking: false, // Disable type checking during dev
  },
};