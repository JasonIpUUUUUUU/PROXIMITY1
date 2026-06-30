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

// Mock react-native-safe-area-context
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }) => children,
  SafeAreaView: ({ children }) => children,
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons', () => ({
  default: {
    getImageSource: jest.fn(),
  },
}));

// Mock react-native-geolocation-service
jest.mock('react-native-geolocation-service', () => ({
  requestAuthorization: jest.fn(() => Promise.resolve('granted')),
  getCurrentPosition: jest.fn((success, error) => {
    success({
      coords: {
        latitude: 52.2919,
        longitude: -1.5358,
        accuracy: 10,
        altitude: 0,
        heading: 0,
        speed: 0,
      },
      timestamp: Date.now(),
    });
  }),
  watchPosition: jest.fn(() => 123),
  clearWatch: jest.fn(),
}));