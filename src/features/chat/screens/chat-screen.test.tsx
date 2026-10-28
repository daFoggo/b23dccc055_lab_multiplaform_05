import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ChatScreen } from './chat-screen';
import { useAuth } from '../../auth/auth-context';
import { useMessages } from '../hooks/use-messages';
import { usePeer } from '../hooks/use-peer';
import { paperTheme } from '../../../theme/paper-theme';

jest.mock('../../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../auth/auth-context', () => ({ useAuth: jest.fn() }));
jest.mock('../hooks/use-messages', () => ({ useMessages: jest.fn() }));
jest.mock('../hooks/use-peer', () => ({ usePeer: jest.fn() }));
jest.mock('@react-navigation/elements', () => ({ useHeaderHeight: () => 56 }));
jest.mock(
  'react-native-vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons',
);

const send = jest.fn();
const sendLocation = jest.fn();
const route = { params: { peerId: 'b', peerName: 'Bình' } };

let headerTitle: (() => React.ReactNode) | undefined;
const navigation = {
  setOptions: (o: { headerTitle?: () => React.ReactNode }) => {
    headerTitle = o.headerTitle;
  },
};

const mounted: ReactTestRenderer.ReactTestRenderer[] = [];
afterEach(async () => {
  for (const r of mounted.splice(0)) {
    await act(async () => r.unmount());
  }
});

async function render() {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 640 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <PaperProvider theme={paperTheme}>
          <ChatScreen route={route as any} navigation={navigation as any} />
        </PaperProvider>
      </SafeAreaProvider>,
    );
  });
  mounted.push(r);
  return r;
}

beforeEach(() => {
  jest.clearAllMocks();
  headerTitle = undefined;
  (useAuth as jest.Mock).mockReturnValue({
    user: { uid: 'a', name: 'An', email: 'a@b.c' },
  });
  (useMessages as jest.Mock).mockReturnValue({
    items: [],
    loadOlder: jest.fn(),
    send,
    retry: jest.fn(),
  });
  (usePeer as jest.Mock).mockReturnValue({
    uid: 'b',
    name: 'Bình',
    online: true,
  });
});

it('shows the peer name and the online subtitle in the header', async () => {
  await render();
  expect(headerTitle).toBeDefined();
  let h!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    h = ReactTestRenderer.create(
      <PaperProvider theme={paperTheme}>
        {headerTitle!() as never}
      </PaperProvider>,
    );
  });
  mounted.push(h);
  const out = JSON.stringify(h.toJSON());
  expect(out).toContain('Bình');
  expect(out).toContain('online');
});

it('sends through the input and disables send for whitespace', async () => {
  const r = await render();
  const input = () => r.root.findAllByProps({ testID: 'message-input' })[0];
  const btn = () => r.root.findAllByProps({ testID: 'send-button' })[0];
  await act(async () => input().props.onChangeText('   '));
  expect(btn().props.disabled).toBe(true);
  await act(async () => input().props.onChangeText('chào'));
  expect(btn().props.disabled).toBe(false);
  await act(async () => btn().props.onPress());
  expect(send).toHaveBeenCalledWith('chào');
});

it('renders no list without a signed-in user', async () => {
  (useAuth as jest.Mock).mockReturnValue({ user: null });
  const r = await render();
  expect(r.root.findAllByProps({ testID: 'message-list' })).toHaveLength(0);
});

describe('send location', () => {
  const { Linking } = require('react-native');
  const loc = require('../../../services/location-service');

  const press = async (r: ReactTestRenderer.ReactTestRenderer) => {
    await act(async () => {
      r.root.findAllByProps({ testID: 'location-button' })[0].props.onPress();
    });
  };

  beforeEach(() => {
    (useMessages as jest.Mock).mockReturnValue({
      items: [],
      loadOlder: jest.fn(),
      send,
      sendLocation,
      retry: jest.fn(),
    });
  });

  it('sends coordinates on success', async () => {
    jest
      .spyOn(loc, 'getCurrentCoords')
      .mockResolvedValue({ lat: 21.03, lng: 105.85 });
    const r = await render();
    await press(r);
    expect(sendLocation).toHaveBeenCalledWith({ lat: 21.03, lng: 105.85 });
  });

  it('shows the permission Snackbar and does not send on denial', async () => {
    jest
      .spyOn(loc, 'getCurrentCoords')
      .mockRejectedValue(new loc.LocationPermissionError());
    const open = jest.spyOn(Linking, 'openSettings').mockResolvedValue(undefined);
    const r = await render();
    await press(r);
    expect(JSON.stringify(r.toJSON())).toContain(
      'Cần cấp quyền vị trí để gửi vị trí.',
    );
    expect(sendLocation).not.toHaveBeenCalled();
    const action = r.root.findAll(
      n => n.props.accessibilityLabel === 'Cài đặt' && n.props.onPress,
    )[0];
    await act(async () => action.props.onPress());
    expect(open).toHaveBeenCalled();
  });

  it('shows a generic Snackbar for other errors', async () => {
    jest
      .spyOn(loc, 'getCurrentCoords')
      .mockRejectedValue(new Error('Không lấy được vị trí'));
    const r = await render();
    await press(r);
    expect(JSON.stringify(r.toJSON())).toContain('Không lấy được vị trí.');
    expect(sendLocation).not.toHaveBeenCalled();
  });

  it('ignores a second tap while fetching', async () => {
    let resolve!: (c: { lat: number; lng: number }) => void;
    const spy = jest.spyOn(loc, 'getCurrentCoords').mockReturnValue(
      new Promise(res => {
        resolve = res;
      }),
    );
    const r = await render();
    await press(r);
    await press(r);
    expect(spy).toHaveBeenCalledTimes(1);
    await act(async () => resolve({ lat: 1, lng: 2 }));
    expect(sendLocation).toHaveBeenCalledTimes(1);
  });
});
