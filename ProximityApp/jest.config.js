module.exports = {
  preset: 'react-native',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transformIgnorePatterns: [
    '/node_modules/(?!(react-native|@react-native|react-native-vector-icons|@rnmapbox|firebase|@react-native-community|react-native-reanimated|react-native-gesture-handler|react-native-safe-area-context|react-native-screens)/).*/',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverageFrom: ['src/**/*.{js,jsx,ts,tsx}', '!src/**/*.d.ts'],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  testEnvironment: 'node',
  verbose: true,
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
};