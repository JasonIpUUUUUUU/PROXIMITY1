module.exports = {
  presets: [
    '@react-native/babel-preset',
  ],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        root: ['./src'],
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
        alias: {
          '@': './src',
          '@models': './src/models',
          '@services': './src/services',
          '@logic': './src/logic',
          '@components': './src/components',
          '@utils': './src/utils',
        },
      },
    ],
  ],
};