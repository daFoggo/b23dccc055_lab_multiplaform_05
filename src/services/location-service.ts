import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';

export class LocationPermissionError extends Error {
  constructor(message = 'Chưa được cấp quyền vị trí') {
    super(message);
    this.name = 'LocationPermissionError';
    Object.setPrototypeOf(this, LocationPermissionError.prototype);
  }
}

const PERMISSION_DENIED = 1;
const UNAVAILABLE_MESSAGE = 'Không lấy được vị trí';

let configured = false;

async function ensureAndroidPermission(): Promise<void> {
  const { PERMISSIONS, RESULTS } = PermissionsAndroid;
  // Android 12+ lets the user pick "approximate" (coarse only): accept either.
  // requestMultiple has no rationale dialog; the system prompt is shown.
  const result = await PermissionsAndroid.requestMultiple([
    PERMISSIONS.ACCESS_FINE_LOCATION,
    PERMISSIONS.ACCESS_COARSE_LOCATION,
  ]);
  const granted =
    result[PERMISSIONS.ACCESS_FINE_LOCATION] === RESULTS.GRANTED ||
    result[PERMISSIONS.ACCESS_COARSE_LOCATION] === RESULTS.GRANTED;
  if (!granted) {
    throw new LocationPermissionError();
  }
}

function ensureIosAuthorization(): Promise<void> {
  if (!configured) {
    Geolocation.setRNConfiguration({
      skipPermissionRequests: false,
      authorizationLevel: 'whenInUse',
    });
    configured = true;
  }
  return new Promise((resolve, reject) => {
    Geolocation.requestAuthorization(
      () => resolve(),
      error =>
        reject(
          error?.code === PERMISSION_DENIED
            ? new LocationPermissionError()
            : new Error(UNAVAILABLE_MESSAGE),
        ),
    );
  });
}

const POSITION_UNAVAILABLE = 2;
const TIMEOUT = 3;

class PositionError {
  constructor(readonly cause: Error, readonly retryable: boolean) {}
}

function readPosition(options: {
  enableHighAccuracy: boolean;
  timeout: number;
  maximumAge: number;
}): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      error =>
        reject(
          error?.code === PERMISSION_DENIED
            ? new PositionError(new LocationPermissionError(), false)
            : new PositionError(
                new Error(UNAVAILABLE_MESSAGE),
                error?.code === POSITION_UNAVAILABLE || error?.code === TIMEOUT,
              ),
        ),
      options,
    );
  });
}

export async function getCurrentCoords(): Promise<{
  lat: number;
  lng: number;
}> {
  if (Platform.OS === 'android') {
    await ensureAndroidPermission();
  } else {
    await ensureIosAuthorization();
  }
  try {
    return await readPosition({
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    });
  } catch (e) {
    if (e instanceof PositionError && e.retryable) {
      return readPosition({
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 10000,
      }).catch(err => {
        throw err instanceof PositionError ? err.cause : err;
      });
    }
    throw e instanceof PositionError ? e.cause : e;
  }
}
