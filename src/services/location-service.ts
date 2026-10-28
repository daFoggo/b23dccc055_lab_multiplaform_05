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
  const result = await PermissionsAndroid.request(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    {
      title: 'Quyền truy cập vị trí',
      message: 'Ứng dụng cần vị trí của bạn để gửi cho người đang trò chuyện.',
      buttonPositive: 'Đồng ý',
      buttonNegative: 'Từ chối',
    },
  );
  if (result !== PermissionsAndroid.RESULTS.GRANTED) {
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

export async function getCurrentCoords(): Promise<{
  lat: number;
  lng: number;
}> {
  if (Platform.OS === 'android') {
    await ensureAndroidPermission();
  } else {
    await ensureIosAuthorization();
  }
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
            ? new LocationPermissionError()
            : new Error(UNAVAILABLE_MESSAGE),
        ),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 },
    );
  });
}
