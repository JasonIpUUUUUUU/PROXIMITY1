module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-worklets/plugin',  // Must come before reanimated
    'react-native-reanimated/plugin', // Must be last
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