module.exports = {
  preset: '@react-native/jest-preset',
  globalSetup: '<rootDir>/jest.global-setup.js',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-navigation|react-native-paper|react-native-screens|react-native-safe-area-context|react-native-vector-icons)/)',
  ],
};
