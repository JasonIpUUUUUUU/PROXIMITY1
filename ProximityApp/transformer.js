const upstreamTransformer = require('@react-native/metro-babel-transformer');
const babelPreset = require('@react-native/babel-preset');

module.exports.transform = async ({ src, filename, options }) => {
  const babelOptions = {
    ...options,
    presets: [
      [babelPreset, {
        useTransformReactJSXExperimental: true,
      }],
    ],
    // Your custom plugins can still be added here if needed
  };

  return upstreamTransformer.transform({
    src,
    filename,
    options: babelOptions,
  });
};