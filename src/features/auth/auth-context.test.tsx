import React from 'react';
import { Text } from 'react-native';
import { act, create } from 'react-test-renderer';
import { AuthProvider, useAuth } from './auth-context';

let authCb: (u: { uid: string; name: string; email: string } | null) => void;
let profileCb: (p: { name: string } | null) => void;
const mockUnsubProfile = jest.fn();

jest.mock('../../services/auth-service', () => ({
  subscribeAuth: (cb: typeof authCb) => {
    authCb = cb;
    return jest.fn();
  },
}));
jest.mock('../../services/presence-service', () => ({
  startPresence: jest.fn(() => jest.fn()),
}));
jest.mock('../../services/user-service', () => ({
  subscribeUser: (_uid: string, cb: typeof profileCb) => {
    profileCb = cb;
    return mockUnsubProfile;
  },
}));

function Probe() {
  const { user } = useAuth();
  return <Text testID="name">{user ? user.name : 'none'}</Text>;
}

test('user.name prefers users/{uid}/name over the auth display name', () => {
  let r!: ReturnType<typeof create>;
  act(() => {
    r = create(
      <AuthProvider>
        <Probe />
      </AuthProvider>,
    );
  });
  act(() => authCb({ uid: 'u1', name: 'user1', email: 'user1@gmail.com' }));
  expect(r.root.findByProps({ testID: 'name' }).props.children).toBe('user1');
  act(() => profileCb({ name: 'User 1' }));
  expect(r.root.findByProps({ testID: 'name' }).props.children).toBe('User 1');
  act(() => authCb(null));
  expect(r.root.findByProps({ testID: 'name' }).props.children).toBe('none');
  expect(mockUnsubProfile).toHaveBeenCalled();
});
