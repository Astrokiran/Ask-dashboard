// craco.config.js
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      // Find the ForkTsCheckerWebpackPlugin instance
      const forkTsCheckerWebpackPlugin = webpackConfig.plugins.find(
        p => p.constructor.name === 'ForkTsCheckerWebpackPlugin'
      );

      // If the plugin is found, update its memory limit
      if (forkTsCheckerWebpackPlugin) {
        forkTsCheckerWebpackPlugin.options.typescript.memoryLimit = 4096; // Increase memory to 4GB
      }

      return webpackConfig;
    },
  },
};