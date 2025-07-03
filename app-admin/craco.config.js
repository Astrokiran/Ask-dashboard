const CracoAlias = require('craco-alias');

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        // Add the line below to specify the path to your tsconfig.json
        tsConfigPath: 'tsconfig.json',
        baseUrl: './',
        aliases: {
          '@': './src',
        },
      },
    },
  ],
};