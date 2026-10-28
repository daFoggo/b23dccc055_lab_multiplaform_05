import { onValue, ref, set } from 'firebase/database';
import {
  createUserProfile,
  subscribeUser,
  subscribeUsers,
} from './user-service';

jest.mock('./firebase', () => ({ auth: {}, db: {} }));

it('writes users/{uid} with name and online true', async () => {
  (set as jest.Mock).mockResolvedValue(undefined);
  await createUserProfile('u1', 'An');
  expect(ref).toHaveBeenCalledWith(expect.anything(), 'users/u1');
  expect(set).toHaveBeenCalledWith(
    { path: 'users/u1' },
    { name: 'An', online: true },
  );
});

describe('subscribeUsers / subscribeUser', () => {
  const snap = (obj: Record<string, unknown> | null) => ({
    exists: () => obj !== null,
    val: () => obj,
  });

  beforeEach(() => {
    (onValue as jest.Mock).mockReset();
  });

  it('excludes own uid, sorts by name, and stops after unsubscribe', () => {
    let handler: (s: unknown) => void = () => {};
    const detach = jest.fn();
    (onValue as jest.Mock).mockImplementation((_r, cb) => {
      handler = cb;
      return detach;
    });
    const cb = jest.fn();
    const unsub = subscribeUsers('me', cb);
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'users');
    handler(
      snap({
        b: { name: 'Bình', online: true },
        me: { name: 'Tôi', online: true },
        a: { name: 'An', online: false, lastSeen: 5 },
      }),
    );
    expect(cb).toHaveBeenCalledWith([
      { uid: 'a', name: 'An', online: false, lastSeen: 5 },
      { uid: 'b', name: 'Bình', online: true, lastSeen: undefined },
    ]);
    unsub();
    expect(detach).toHaveBeenCalled();
    // A detached listener must not be invoked; emulate by honouring detach.
  });

  it('does not call cb after unsubscribe (guard)', () => {
    let handler: (s: unknown) => void = () => {};
    (onValue as jest.Mock).mockImplementation((_r, cb) => {
      handler = cb;
      return jest.fn();
    });
    const cb = jest.fn();
    const unsub = subscribeUsers('me', cb);
    unsub();
    handler(snap({ a: { name: 'An', online: true } }));
    expect(cb).not.toHaveBeenCalled();
  });

  it('returns empty list for empty snapshot', () => {
    let handler: (s: unknown) => void = () => {};
    (onValue as jest.Mock).mockImplementation((_r, cb) => {
      handler = cb;
      return jest.fn();
    });
    const cb = jest.fn();
    subscribeUsers('me', cb);
    handler(snap(null));
    expect(cb).toHaveBeenCalledWith([]);
  });

  it('subscribeUser maps one profile or null', () => {
    let handler: (s: unknown) => void = () => {};
    const detach = jest.fn();
    (onValue as jest.Mock).mockImplementation((_r, cb) => {
      handler = cb;
      return detach;
    });
    const cb = jest.fn();
    const unsub = subscribeUser('u9', cb);
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'users/u9');
    handler({ exists: () => true, val: () => ({ name: 'Cúc', online: true }) });
    expect(cb).toHaveBeenLastCalledWith({
      uid: 'u9',
      name: 'Cúc',
      online: true,
      lastSeen: undefined,
    });
    handler({ exists: () => false, val: () => null });
    expect(cb).toHaveBeenLastCalledWith(null);
    unsub();
    expect(detach).toHaveBeenCalled();
  });

  it('forwards listener errors to onError (not after unsubscribe)', () => {
    let errCb: (e: Error) => void = () => {};
    (onValue as jest.Mock).mockImplementation((_r, _cb, err) => {
      errCb = err;
      return jest.fn();
    });
    const onError = jest.fn();
    const unsub = subscribeUsers('me', jest.fn(), onError);
    errCb(new Error('denied'));
    expect(onError).toHaveBeenCalledTimes(1);
    unsub();
    errCb(new Error('again'));
    expect(onError).toHaveBeenCalledTimes(1);
    const onError2 = jest.fn();
    subscribeUser('u1', jest.fn(), onError2);
    errCb(new Error('x'));
    expect(onError2).toHaveBeenCalledTimes(1);
  });
});
