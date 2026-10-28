import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { Dialog, PaperProvider } from 'react-native-paper';
import { SettingsScreen } from './settings-screen';
import { logoutUser } from '../../../services/auth-service';

jest.mock('../../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../../services/auth-service', () => ({ logoutUser: jest.fn() }));
jest.mock('../../auth/auth-context', () => ({
  useAuth: () => ({
    user: { uid: 'u1', name: 'Nguyễn An', email: 'an@x.com' },
  }),
}));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => ({
  __esModule: true,
  default: 'MaterialCommunityIcons',
}));

const mockLogout = logoutUser as jest.Mock;

type Node = ReactTestRenderer.ReactTestRendererJSON | string;
function collect(n: Node | Node[] | null): string {
  if (n === null) {
    return '';
  }
  if (typeof n === 'string') {
    return n + '|';
  }
  if (Array.isArray(n)) {
    return n.map(collect).join('');
  }
  return collect((n.children ?? []) as Node[]);
}
const text = (r: ReactTestRenderer.ReactTestRenderer) =>
  collect(r.toJSON() as Node | Node[] | null);

let current: ReactTestRenderer.ReactTestRenderer | undefined;
beforeEach(() => mockLogout.mockReset());
afterEach(async () => {
  await act(async () => current?.unmount());
  current = undefined;
});

async function setup() {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <PaperProvider>
        <SettingsScreen />
      </PaperProvider>,
    );
  });
  current = r;
  return r;
}
const press = (r: ReactTestRenderer.ReactTestRenderer, id: string) =>
  act(async () => {
    r.root.findByProps({ testID: id }).props.onPress();
  });

it('shows name and email', async () => {
  const r = await setup();
  expect(text(r)).toContain('Nguyễn An');
  expect(text(r)).toContain('an@x.com');
  expect(text(r)).toContain('1.0.0');
});

it('opens confirm dialog without logging out yet', async () => {
  const r = await setup();
  expect(text(r)).not.toContain('Đăng xuất khỏi tài khoản?');
  await press(r, 'logout-button');
  expect(text(r)).toContain('Đăng xuất khỏi tài khoản?');
  expect(mockLogout).not.toHaveBeenCalled();
});

it('confirm calls logoutUser once', async () => {
  mockLogout.mockResolvedValue(undefined);
  const r = await setup();
  await press(r, 'logout-button');
  await press(r, 'logout-confirm');
  expect(mockLogout).toHaveBeenCalledTimes(1);
});

it('cancel closes dialog and does not log out', async () => {
  const r = await setup();
  await press(r, 'logout-button');
  await press(r, 'logout-cancel');
  expect(mockLogout).not.toHaveBeenCalled();
  expect(r.root.findByType(Dialog).props.visible).toBe(false);
});

it('failure shows snackbar and keeps the screen', async () => {
  mockLogout.mockRejectedValue(new Error('x'));
  const r = await setup();
  await press(r, 'logout-button');
  await press(r, 'logout-confirm');
  expect(text(r)).toContain('Đăng xuất thất bại. Thử lại.');
  expect(text(r)).toContain('an@x.com');
});

it('double tap on confirm calls once', async () => {
  let resolve!: () => void;
  mockLogout.mockReturnValue(new Promise<void>(res => (resolve = res)));
  const r = await setup();
  await press(r, 'logout-button');
  await act(async () => {
    const p = r.root.findByProps({ testID: 'logout-confirm' }).props;
    p.onPress();
    p.onPress();
  });
  expect(mockLogout).toHaveBeenCalledTimes(1);
  await act(async () => resolve());
});
