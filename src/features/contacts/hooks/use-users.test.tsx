import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { useUsers } from './use-users';
import { subscribeUsers } from '../../../services/user-service';

jest.mock('../../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../../services/user-service', () => ({
  subscribeUsers: jest.fn(),
}));

type Result = ReturnType<typeof useUsers>;

async function run(uid: string) {
  const out: { current?: Result } = {};
  function Probe() {
    out.current = useUsers(uid);
    return null;
  }
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(<Probe />);
  });
  return { out, r };
}

beforeEach(() => (subscribeUsers as jest.Mock).mockReset());

it('does not subscribe for an empty uid', async () => {
  const { out } = await run('');
  expect(subscribeUsers).not.toHaveBeenCalled();
  expect(out.current).toEqual({ users: [], loading: false, error: null });
});

it('exposes users, then unsubscribes on unmount', async () => {
  const unsub = jest.fn();
  (subscribeUsers as jest.Mock).mockImplementation((_u, cb) => {
    cb([{ uid: 'a', name: 'An', online: true }]);
    return unsub;
  });
  const { out, r } = await run('me');
  expect(out.current?.users).toHaveLength(1);
  expect(out.current?.loading).toBe(false);
  await act(async () => r.unmount());
  expect(unsub).toHaveBeenCalled();
});

it('sets error and stops loading on failure', async () => {
  (subscribeUsers as jest.Mock).mockImplementation((_u, _cb, onError) => {
    onError(new Error('denied'));
    return jest.fn();
  });
  const { out } = await run('me');
  expect(out.current?.loading).toBe(false);
  expect(out.current?.error).toBe('Không tải được danh bạ');
});
