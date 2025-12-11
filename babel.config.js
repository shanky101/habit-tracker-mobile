const path = require('path');

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@app-core/theme': './packages/theme/src',
            '@app-core/ui': './packages/ui/src',
            '@app-core/storage': './packages/storage/src',
            '@app-core/subscription': './packages/subscription/src',
            '@features/mascot': './packages/mascot/src',
            // Ensure single React instance
            'react': path.resolve(__dirname, 'node_modules/react'),
            'react-native': path.resolve(__dirname, 'node_modules/react-native'),
          },
        },
      ],
    ],
  };
};
