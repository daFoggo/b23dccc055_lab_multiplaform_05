/* eslint-env jest */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest'),
);

// Firebase is never called for real in tests.
jest.mock('firebase/app', () => ({
  initializeApp: jest.fn(() => ({name: '[DEFAULT]'})),
  getApps: jest.fn(() => []),
  getApp: jest.fn(() => ({name: '[DEFAULT]'})),
}));

jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(() => ({currentUser: null})),
  getAuth: jest.fn(() => ({currentUser: null})),
  getReactNativePersistence: jest.fn(() => ({type: 'RN_PERSISTENCE'})),
  createUserWithEmailAndPassword: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  updateProfile: jest.fn(),
  deleteUser: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

jest.mock('firebase/database', () => ({
  getDatabase: jest.fn(() => ({})),
  ref: jest.fn((_db, path) => ({path})),
  set: jest.fn(),
  update: jest.fn(),
  get: jest.fn(),
  push: jest.fn(),
  remove: jest.fn(),
  onValue: jest.fn(),
  onChildAdded: jest.fn(),
  onDisconnect: jest.fn(() => ({set: jest.fn(), cancel: jest.fn()})),
  runTransaction: jest.fn(),
  query: jest.fn(),
  orderByChild: jest.fn(),
  limitToLast: jest.fn(),
  endBefore: jest.fn(),
  serverTimestamp: jest.fn(() => ({'.sv': 'timestamp'})),
}));

// Native module is not linked under jest.
jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    setRNConfiguration: jest.fn(),
    requestAuthorization: jest.fn(),
    getCurrentPosition: jest.fn(),
  },
}));
