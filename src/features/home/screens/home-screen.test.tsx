import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { HomeScreen } from './home-screen';
import { useConversationsContext } from '../conversations-context';

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({ navigate: mockNavigate }),
}));
jest.mock(
  'react-native-vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons',
);
jest.mock('../conversations-context', () => ({
  useConversationsContext: jest.fn(),
}));

const mockCtx = useConversationsContext as jest.Mock;
const now = Date.now();

let current: ReactTestRenderer.ReactTestRenderer | undefined;
afterEach(() => {
  mockNavigate.mockReset();
  if (current) {
    act(() => {
      current?.unmount();
    });
    current = undefined;
  }
});

function render() {
  let r!: ReactTestRenderer.ReactTestRenderer;
  act(() => {
    r = ReactTestRenderer.create(
      <SafeAreaProvider
        initialMetrics={{
          frame: { x: 0, y: 0, width: 360, height: 640 },
          insets: { top: 0, left: 0, right: 0, bottom: 0 },
        }}
      >
        <PaperProvider>
          <HomeScreen />
        </PaperProvider>
      </SafeAreaProvider>,
    );
  });
  current = r;
  return r;
}

it('renders rows with name, preview, badge and navigates on press', () => {
  mockCtx.mockReturnValue({
    conversations: [
      {
        peerId: 'a',
        peerName: 'An Nguyen',
        lastMessage: 'xin chao',
        lastType: 'text',
        lastAt: now,
        unread: 120,
      },
      {
        peerId: 'b',
        peerName: 'Binh',
        lastMessage: 'x',
        lastType: 'location',
        lastAt: now - 3 * 86400000,
        unread: 0,
      },
    ],
    totalUnread: 120,
    loading: false,
  });
  const r = render();
  const json = JSON.stringify(r.toJSON());
  expect(json).toContain('An Nguyen');
  expect(json).toContain('xin chao');
  expect(json).toContain('99+');
  expect(json).toContain('Vị trí');
  expect(r.root.findAllByProps({ testID: 'unread-b' })).toHaveLength(0);
  expect(r.root.findAllByProps({ testID: 'unread-a' }).length).toBeGreaterThan(
    0,
  );
  expect(
    r.root.findAllByProps({ testID: 'conversation-a' })[0].props
      .accessibilityLabel,
  ).toBe('An Nguyen, 120 tin chưa đọc, xin chao');
  expect(
    r.root.findAllByProps({ testID: 'conversation-b' })[0].props
      .accessibilityLabel,
  ).toBe('Binh, Vị trí');
  act(() => {
    r.root.findAllByProps({ testID: 'conversation-a' })[0].props.onPress();
  });
  expect(mockNavigate).toHaveBeenCalledWith('Chat', {
    peerId: 'a',
    peerName: 'An Nguyen',
  });
});

it('shows empty state with a button to Contacts', () => {
  mockCtx.mockReturnValue({
    conversations: [],
    totalUnread: 0,
    loading: false,
  });
  const r = render();
  expect(JSON.stringify(r.toJSON())).toContain('Chưa có cuộc trò chuyện nào');
  act(() => {
    r.root.findAllByProps({ testID: 'go-contacts' })[0].props.onPress();
  });
  expect(mockNavigate).toHaveBeenCalledWith('Contacts');
});

it('shows a loading indicator before the first snapshot', () => {
  mockCtx.mockReturnValue({ conversations: [], totalUnread: 0, loading: true });
  const r = render();
  expect(
    r.root.findAllByProps({ testID: 'home-loading' }).length,
  ).toBeGreaterThan(0);
  expect(JSON.stringify(r.toJSON())).not.toContain(
    'Chưa có cuộc trò chuyện nào',
  );
});

it('shows the error text', () => {
  mockCtx.mockReturnValue({
    conversations: [],
    totalUnread: 0,
    loading: false,
    error: 'Không tải được danh sách trò chuyện',
  });
  expect(JSON.stringify(render().toJSON())).toContain(
    'Không tải được danh sách trò chuyện',
  );
});
