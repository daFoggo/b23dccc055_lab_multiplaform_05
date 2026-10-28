import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { List, PaperProvider } from 'react-native-paper';
import { NotificationsScreen } from './notifications-screen';

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('react-native-vector-icons/MaterialCommunityIcons', () => ({
  __esModule: true,
  default: 'MaterialCommunityIcons',
}));

let current: ReactTestRenderer.ReactTestRenderer | undefined;
afterEach(async () => {
  await act(async () => current?.unmount());
  current = undefined;
});

async function setup() {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <PaperProvider>
        <NotificationsScreen />
      </PaperProvider>,
    );
  });
  current = r;
  return r;
}
const items = (r: ReactTestRenderer.ReactTestRenderer) =>
  r.root.findAllByType(List.Item);
const unreadDots = (r: ReactTestRenderer.ReactTestRenderer) =>
  r.root.findAll(
    n =>
      typeof n.props.testID === 'string' &&
      n.props.testID.startsWith('unread-dot-') &&
      typeof n.type === 'string',
  );

it('renders 4 notifications with 2 unread', async () => {
  const r = await setup();
  expect(items(r)).toHaveLength(4);
  expect(unreadDots(r)).toHaveLength(2);
});

it('tapping a notification clears its unread dot', async () => {
  const r = await setup();
  await act(async () => items(r)[0].props.onPress());
  expect(unreadDots(r)).toHaveLength(1);
  expect(r.root.findAll(n => n.props.testID === 'unread-dot-0')).toHaveLength(
    0,
  );
});
