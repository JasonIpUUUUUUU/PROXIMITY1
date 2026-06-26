// Add ESLint comment to ignore no-undef for jest
/* eslint-env jest */
import 'react-native-gesture-handler/jestSetup';

jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

jest.mock('@rnmapbox/maps', () => ({
  MapView: 'MapView',
  Camera: 'Camera',
  ShapeSource: 'ShapeSource',
  CircleLayer: 'CircleLayer',
  SymbolLayer: 'SymbolLayer',
  StyleURL: {
    Dark: 'mapbox://styles/mapbox/dark-v11',
  },
}));

jest.mock('react-native/Libraries/Animated/NativeAnimatedHelper');
