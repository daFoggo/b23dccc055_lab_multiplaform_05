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

const FINE = 'android.permission.ACCESS_FINE_LOCATION';
const COARSE = 'android.permission.ACCESS_COARSE_LOCATION';
let requestSpy: jest.SpyInstance;
const grants = (fine: string, coarse: string) =>
  requestSpy.mockResolvedValue({ [FINE]: fine, [COARSE]: coarse } as never);

beforeEach(() => {
  jest.clearAllMocks();
  setOS('android');
  requestSpy = jest
    .spyOn(PermissionsAndroid, 'requestMultiple')
    .mockResolvedValue({ [FINE]: 'granted', [COARSE]: 'granted' } as never);
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
  grants('denied', 'denied');
  await expect(getCurrentCoords()).rejects.toBeInstanceOf(
    LocationPermissionError,
  );
  expect(geo.getCurrentPosition).not.toHaveBeenCalled();
});

it('throws LocationPermissionError on never_ask_again', async () => {
  grants('never_ask_again', 'denied');
  await expect(getCurrentCoords()).rejects.toBeInstanceOf(
    LocationPermissionError,
  );
});

it('requests both fine and coarse permissions and returns coordinates', async () => {
  await expect(getCurrentCoords()).resolves.toEqual({
    lat: 21.03,
    lng: 105.85,
  });
  expect(requestSpy.mock.calls[0][0]).toEqual([FINE, COARSE]);
  expect(geo.getCurrentPosition.mock.calls[0][2]).toEqual({
    enableHighAccuracy: true,
    timeout: 15000,
    maximumAge: 10000,
  });
});

it('treats approximate-only (coarse granted) as granted', async () => {
  grants('denied', 'granted');
  await expect(getCurrentCoords()).resolves.toEqual({
    lat: 21.03,
    lng: 105.85,
  });
});

it('retries once with low accuracy when high accuracy times out', async () => {
  geo.getCurrentPosition
    .mockImplementationOnce((_ok: unknown, err: (e: unknown) => void) =>
      err({ code: 3, message: 'timeout' }),
    )
    .mockImplementationOnce((ok: (p: unknown) => void) =>
      ok({ coords: { latitude: 1, longitude: 2 } }),
    );
  await expect(getCurrentCoords()).resolves.toEqual({ lat: 1, lng: 2 });
  expect(geo.getCurrentPosition).toHaveBeenCalledTimes(2);
  expect(geo.getCurrentPosition.mock.calls[1][2]).toMatchObject({
    enableHighAccuracy: false,
    timeout: 10000,
  });
});

it('retries when high accuracy reports position unavailable (code 2)', async () => {
  geo.getCurrentPosition
    .mockImplementationOnce((_ok: unknown, err: (e: unknown) => void) =>
      err({ code: 2 }),
    )
    .mockImplementationOnce((ok: (p: unknown) => void) =>
      ok({ coords: { latitude: 3, longitude: 4 } }),
    );
  await expect(getCurrentCoords()).resolves.toEqual({ lat: 3, lng: 4 });
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

it('maps timeout (code 3) on both attempts to a plain Error', async () => {
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
