import AsyncStorage from '@react-native-async-storage/async-storage';
import {getApp, getApps, initializeApp} from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  type Auth,
} from 'firebase/auth';
import {getDatabase, type Database} from 'firebase/database';
import {firebaseConfig} from './firebase-config';

// Fast refresh re-evaluates this module: reuse the existing app/auth instead
// of initializing twice (initializeAuth throws on a second call).
const isFirstInit = getApps().length === 0;
const app = isFirstInit ? initializeApp(firebaseConfig) : getApp();

export const auth: Auth = isFirstInit
  ? initializeAuth(app, {persistence: getReactNativePersistence(AsyncStorage)})
  : getAuth(app);

export const db: Database = getDatabase(app);
