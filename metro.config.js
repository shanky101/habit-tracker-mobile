const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add resolver to mock react-native-reanimated
config.resolver = {
    ...config.resolver,
    extraNodeModules: {
        'react-native-reanimated': path.resolve(__dirname, 'react-native-reanimated-mock.ts'),
    },
};

module.exports = config;
