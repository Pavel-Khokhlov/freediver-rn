module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ['@babel/plugin-proposal-class-properties', {loose: true}], // For static class properties
    ['@babel/plugin-proposal-private-methods', {loose: true}], // For private methods (#)
    [
      'module-resolver',
      {
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        root: ['./'],
        alias: {
          '@': './src',
          '@components': './src/components',
          '@contexts': './src/contexts',
          '@screens': './src/screens',
          '@store': './src/store',
          '@utils': './src/utils',
          '@hooks': './src/hooks',
          '@services': './src/services',
          '@types': './src/types',
          '@assets': './src/assets',
          '@locales': './src/locales',
        },
      },
    ],
    // react-native-reanimated/plugin has to be listed last.
    'react-native-reanimated/plugin',
  ],
};
