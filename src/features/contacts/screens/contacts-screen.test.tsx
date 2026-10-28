import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { FlatList } from 'react-native';
import { PaperProvider } from 'react-native-paper';
import { ContactsScreen } from './contacts-screen';
import { subscribeUsers } from '../../../services/user-service';

jest.mock('../../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../../services/user-service', () => ({
  subscribeUsers: jest.fn(),
}));
jest.mock('../../auth/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'me', name: 'Me', email: 'm@x' } }),
}));
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

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
afterEach(async () => {
  await act(async () => current?.unmount());
  current = undefined;
});

async function setup(users: unknown[], fail = false) {
  (subscribeUsers as jest.Mock).mockImplementation((_uid, cb, onError) => {
    if (fail) {
      onError(new Error('denied'));
    } else {
      cb(users);
    }
    return jest.fn();
  });
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <PaperProvider>
        <ContactsScreen />
      </PaperProvider>,
    );
  });
  current = r;
  return r;
}

it('shows empty state when nobody else registered', async () => {
  const r = await setup([]);
  expect(text(r)).toContain('Chưa có ai khác đăng ký');
});

it('lists contacts online first, filters, and navigates to Chat on press', async () => {
  const r = await setup([
    { uid: 'a', name: 'An', online: false },
    { uid: 'b', name: 'Bình', online: true },
  ]);
  const json = text(r);
  expect(json.indexOf('Bình')).toBeLessThan(json.indexOf('An'));
  expect(json).toContain('online');
  r.root.findByProps({ testID: 'online-dot-b' });
  await act(async () => {
    r.root.findByProps({ testID: 'contacts-search' }).props.onChangeText('zzz');
  });
  expect(text(r)).toContain('Không tìm thấy kết quả');
  await act(async () => {
    r.root
      .findByProps({ testID: 'contacts-search' })
      .props.onChangeText('binh');
  });
  await act(async () => {
    r.root.findByProps({ testID: 'contact-b' }).props.onPress();
  });
  expect(mockNavigate).toHaveBeenCalledWith('Chat', {
    peerId: 'b',
    peerName: 'Bình',
  });
});

it('shows an error text when loading fails and keeps taps persistent', async () => {
  const r = await setup([], true);
  expect(text(r)).toContain('Không tải được danh bạ');
  expect(r.root.findByType(FlatList).props.keyboardShouldPersistTaps).toBe(
    'handled',
  );
});
