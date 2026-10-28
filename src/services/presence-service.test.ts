import { AppState } from 'react-native';
import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  update,
} from 'firebase/database';
import { setOffline, startPresence } from './presence-service';

jest.mock('./firebase', () => ({ auth: {}, db: {} }));

it('updates users/{uid} with online false and server lastSeen', async () => {
  (update as jest.Mock).mockResolvedValue(undefined);
  await setOffline('u1');
  expect(ref).toHaveBeenCalledWith(expect.anything(), 'users/u1');
  expect(update).toHaveBeenCalledWith(
    { path: 'users/u1' },
    {
      online: false,
      lastSeen: (serverTimestamp as jest.Mock).mock.results[0].value,
    },
  );
});

describe('startPresence', () => {
  let connected: (s: unknown) => void;
  let detach: jest.Mock;
  let appStateHandler: (s: string) => void;
  let removeAppState: jest.Mock;
  let odUpdate: jest.Mock;
  let order: string[];

  const setState = (v: string) =>
    Object.defineProperty(AppState, 'currentState', {
      value: v,
      configurable: true,
    });

  const flush = async () => {
    for (let i = 0; i < 5; i++) {
      await Promise.resolve();
    }
  };

  beforeEach(() => {
    setState('active');
    order = [];
    detach = jest.fn();
    removeAppState = jest.fn();
    odUpdate = jest.fn(() => {
      order.push('onDisconnect');
      return Promise.resolve();
    });
    (onDisconnect as jest.Mock)
      .mockReset()
      .mockReturnValue({ update: odUpdate });
    (update as jest.Mock).mockReset().mockImplementation(() => {
      order.push('update');
      return Promise.resolve();
    });
    (onValue as jest.Mock).mockReset().mockImplementation((_r, cb) => {
      connected = cb;
      return detach;
    });
    jest.spyOn(AppState, 'addEventListener').mockImplementation(((
      _t: string,
      h: (s: string) => void,
    ) => {
      appStateHandler = h;
      return { remove: removeAppState };
    }) as never);
  });

  it('registers onDisconnect first, then sets online true when connected', async () => {
    startPresence('u1');
    expect(ref).toHaveBeenCalledWith(expect.anything(), '.info/connected');
    connected({ val: () => false });
    expect(update).not.toHaveBeenCalled();
    connected({ val: () => true });
    await Promise.resolve();
    await Promise.resolve();
    expect(onDisconnect).toHaveBeenCalledWith({ path: 'users/u1' });
    expect(odUpdate).toHaveBeenCalledWith({
      online: false,
      lastSeen: expect.anything(),
    });
    expect(update).toHaveBeenCalledWith({ path: 'users/u1' }, { online: true });
    expect(order).toEqual(['onDisconnect', 'update']);
  });

  it('sets offline on background and online on foreground', () => {
    startPresence('u1');
    connected({ val: () => true });
    (update as jest.Mock).mockClear();
    appStateHandler('background');
    expect(update).toHaveBeenLastCalledWith(
      { path: 'users/u1' },
      { online: false, lastSeen: expect.anything() },
    );
    appStateHandler('active');
    expect(update).toHaveBeenLastCalledWith(
      { path: 'users/u1' },
      { online: true },
    );
  });

  it('unsubscribe detaches listeners and does not set offline', () => {
    const unsub = startPresence('u1');
    connected({ val: () => true });
    (update as jest.Mock).mockClear();
    unsub();
    expect(detach).toHaveBeenCalled();
    expect(removeAppState).toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('re-registers onDisconnect on every connect, before the online write', async () => {
    startPresence('u1');
    connected({ val: () => true });
    await flush();
    connected({ val: () => false });
    connected({ val: () => true });
    await flush();
    expect(odUpdate).toHaveBeenCalledTimes(2);
    expect(order).toEqual(['onDisconnect', 'update', 'onDisconnect', 'update']);
  });

  it('does not write while disconnected; next connect writes current foreground', async () => {
    startPresence('u1');
    appStateHandler('background');
    appStateHandler('active');
    expect(update).not.toHaveBeenCalled();
    connected({ val: () => true });
    await flush();
    expect(update).toHaveBeenLastCalledWith(
      { path: 'users/u1' },
      { online: true },
    );
  });

  it('background while disconnected then reconnect writes online false', async () => {
    startPresence('u1');
    appStateHandler('background');
    connected({ val: () => true });
    await flush();
    expect(update).toHaveBeenLastCalledWith(
      { path: 'users/u1' },
      { online: false, lastSeen: expect.anything() },
    );
  });

  it('background between onDisconnect registration and write wins (race)', async () => {
    startPresence('u1');
    connected({ val: () => true });
    appStateHandler('background');
    (update as jest.Mock).mockClear();
    await flush();
    expect(update).not.toHaveBeenCalledWith(
      { path: 'users/u1' },
      { online: true },
    );
  });

  it('ignores inactive state', async () => {
    startPresence('u1');
    connected({ val: () => true });
    await flush();
    (update as jest.Mock).mockClear();
    appStateHandler('inactive');
    expect(update).not.toHaveBeenCalled();
  });

  it('starts as offline when app is not active at start', async () => {
    setState('background');
    startPresence('u1');
    connected({ val: () => true });
    await flush();
    expect(update).toHaveBeenLastCalledWith(
      { path: 'users/u1' },
      { online: false, lastSeen: expect.anything() },
    );
  });

  it('after cleanup a connected event or in-flight write does nothing', async () => {
    const unsub = startPresence('u1');
    connected({ val: () => true });
    unsub();
    await flush();
    expect(update).not.toHaveBeenCalled();
    connected({ val: () => true });
    await flush();
    expect(update).not.toHaveBeenCalled();
    expect(onDisconnect).toHaveBeenCalledTimes(1);
  });

  it('two starts with the first cleaned up do not double-write', async () => {
    const first = startPresence('u1');
    const firstConnected = connected;
    first();
    startPresence('u1');
    firstConnected({ val: () => true });
    connected({ val: () => true });
    await flush();
    expect(update).toHaveBeenCalledTimes(1);
    expect(removeAppState).toHaveBeenCalledTimes(1);
    expect(detach).toHaveBeenCalledTimes(1);
  });
});
