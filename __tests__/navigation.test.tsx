import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { RootNavigator } from '../src/navigation/root-navigator';
import { useAuth } from '../src/features/auth/auth-context';
import { subscribeConversations } from '../src/services/chat-service';

jest.mock('../src/services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../src/services/auth-service', () => ({
  loginUser: jest.fn(),
  registerUser: jest.fn(),
  mapAuthError: jest.fn(),
  subscribeAuth: jest.fn(),
}));
jest.mock('../src/services/chat-service', () => ({
  subscribeConversations: jest.fn(() => jest.fn()),
}));
jest.mock('../src/features/auth/auth-context', () => ({
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
  useAuth: jest.fn(),
}));

jest.mock(
  'react-native-vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons',
);

const mockUseAuth = useAuth as jest.Mock;

async function render(
  after?: (r: ReactTestRenderer.ReactTestRenderer) => Promise<void>,
) {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 640 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <PaperProvider>
          <NavigationContainer>
            <RootNavigator />
          </NavigationContainer>
        </PaperProvider>
      </SafeAreaProvider>,
    );
  });
  if (after) {
    await after(r);
  }
  const out = JSON.stringify(r.toJSON());
  await act(async () => r.unmount());
  return out;
}

test('no user shows login screen', async () => {
  mockUseAuth.mockReturnValue({ user: null, initializing: false });
  expect(await render()).toContain('Đăng nhập');
});

test('signed-in user sees four tab labels', async () => {
  mockUseAuth.mockReturnValue({
    user: { uid: 'u1', name: 'A', email: 'a@b.c' },
    initializing: false,
  });
  const out = await render();
  for (const label of ['Trò chuyện', 'Danh bạ', 'Thông báo', 'Cài đặt']) {
    expect(out).toContain(label);
  }
});

test('initializing shows no login screen', async () => {
  mockUseAuth.mockReturnValue({ user: null, initializing: true });
  expect(await render()).not.toContain('Đăng nhập');
});

test('tab badge follows total unread (3 then 0)', async () => {
  mockUseAuth.mockReturnValue({
    user: { uid: 'u1', name: 'A', email: 'a@b.c' },
    initializing: false,
  });
  let push!: (c: unknown[]) => void;
  (subscribeConversations as jest.Mock).mockImplementation((_u, cb) => {
    push = cb;
    return jest.fn();
  });
  const conv = (unread: number) => ({
    peerId: 'p',
    peerName: 'P',
    lastMessage: 'x',
    lastType: 'text',
    lastAt: 10,
    unread,
  });
  (subscribeConversations as jest.Mock).mockClear();
  let withBadge = '';
  let cleared = '';
  await render(async r => {
    await act(async () => push([conv(3)]));
    withBadge = JSON.stringify(r.toJSON());
    await act(async () => push([conv(0)]));
    cleared = JSON.stringify(r.toJSON());
  });
  expect(subscribeConversations).toHaveBeenCalledTimes(1);
  expect(withBadge).toContain('"3"');
  expect(cleared).not.toContain('"3"');
});
