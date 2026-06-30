const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const config = {
  transformer: {
    babelTransformerPath: require.resolve('./transformer.js'),
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: ['jsx', 'js', 'ts', 'tsx', 'json'],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);