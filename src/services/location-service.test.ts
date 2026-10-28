import { PermissionsAndroid, Platform } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { getCurrentCoords, LocationPermissionError } from './location-service';

jest.mock('@react-native-community/geolocation', () => ({
  __esModule: true,
  default: {
    setRNConfiguration: jest.fn(),
    requestAuthorization: jest.fn(),
    getCurrentPosition: jest.fn(),
  },
}));

const geo = Geolocation as unknown as {
  setRNConfiguration: jest.Mock;
  requestAuthorization: jest.Mock;
  getCurrentPosition: jest.Mock;
};

const setOS = (os: 'android' | 'ios') => {
  (Platform as { OS: string }).OS = os;
};

let requestSpy: jest.SpyInstance;

beforeEach(() => {
  jest.clearAllMocks();
  setOS('android');
  requestSpy = jest
    .spyOn(PermissionsAndroid, 'request')
    .mockResolvedValue('granted' as never);
  geo.requestAuthorization.mockImplementation((ok: () => void) => ok());
  geo.getCurrentPosition.mockImplementation((ok: (p: unknown) => void) =>
    ok({ coords: { latitude: 21.03, longitude: 105.85 } }),
  );
});

afterEach(() => {
  requestSpy.mockRestore();
  setOS('android');
});

it('throws LocationPermissionError when permission is denied', async () => {
  requestSpy.mockResolvedValue('denied' as never);
  await expect(getCurrentCoords()).rejects.toBeInstanceOf(
    LocationPermissionError,
  );
  expect(geo.getCurrentPosition).not.toHaveBeenCalled();
});

it('throws LocationPermissionError on never_ask_again', async () => {
  requestSpy.mockResolvedValue('never_ask_again' as never);
  await expect(getCurrentCoords()).rejects.toBeInstanceOf(
    LocationPermissionError,
  );
});

it('returns coordinates when granted, with a Vietnamese rationale and options', async () => {
  await expect(getCurrentCoords()).resolves.toEqual({
    lat: 21.03,
    lng: 105.85,
  });
  expect(requestSpy.mock.calls[0][0]).toBe(
    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
  );
  expect(requestSpy.mock.calls[0][1].message).toMatch(/vị trí/i);
  expect(geo.getCurrentPosition.mock.calls[0][2]).toEqual({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
  });
});

it('maps geolocation error code 1 to LocationPermissionError', async () => {
  geo.getCurrentPosition.mockImplementation(
    (_ok: unknown, err: (e: unknown) => void) =>
      err({ code: 1, message: 'denied' }),
  );
  await expect(getCurrentCoords()).rejects.toBeInstanceOf(
    LocationPermissionError,
  );
});

it('maps timeout (code 3) to a plain Error', async () => {
  geo.getCurrentPosition.mockImplementation(
    (_ok: unknown, err: (e: unknown) => void) =>
      err({ code: 3, message: 'timeout' }),
  );
  const e = await getCurrentCoords().catch(x => x);
  expect(e).toBeInstanceOf(Error);
  expect(e).not.toBeInstanceOf(LocationPermissionError);
  expect(e.message).toBe('Không lấy được vị trí');
});

it('iOS skips PermissionsAndroid and configures + requests authorization', async () => {
  setOS('ios');
  await expect(getCurrentCoords()).resolves.toEqual({
    lat: 21.03,
    lng: 105.85,
  });
  expect(requestSpy).not.toHaveBeenCalled();
  expect(geo.setRNConfiguration).toHaveBeenCalledWith({
    skipPermissionRequests: false,
    authorizationLevel: 'whenInUse',
  });
  expect(geo.requestAuthorization).toHaveBeenCalled();
});

it('iOS authorization error code 1 -> LocationPermissionError', async () => {
  setOS('ios');
  geo.requestAuthorization.mockImplementation(
    (_ok: unknown, err: (e: unknown) => void) => err({ code: 1 }),
  );
  await expect(getCurrentCoords()).rejects.toBeInstanceOf(
    LocationPermissionError,
  );
});
