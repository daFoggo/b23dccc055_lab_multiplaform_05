import React from 'react';
import { Linking } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import { LocationBubble } from './location-bubble';
import { MessageBubble } from './message-bubble';
import { paperTheme } from '../../../theme/paper-theme';
import type { ChatMessage } from '../../../services/types';

jest.mock(
  'react-native-vector-icons/MaterialCommunityIcons',
  () => 'MaterialCommunityIcons',
);

const loc: ChatMessage = {
  id: 'l1',
  senderId: 'a',
  type: 'location',
  lat: 21.0285,
  lng: 105.8542,
  createdAt: new Date(2026, 9, 28, 9, 5).getTime(),
};

async function render(ui: React.ReactElement) {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <PaperProvider theme={paperTheme}>{ui}</PaperProvider>,
    );
  });
  return r;
}

const text = (r: ReactTestRenderer.ReactTestRenderer) =>
  JSON.stringify(r.toJSON());

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

it('shows title, 5-decimal coordinates, action and time', async () => {
  const r = await render(
    <LocationBubble message={loc} mine label="Vị trí của tôi" />,
  );
  const out = text(r);
  expect(out).toContain('Vị trí của tôi');
  expect(out).toContain('21.02850, 105.85420');
  expect(out).toContain('Mở trong Google Maps');
  expect(out).toContain('09:05');
});

it('opens Google Maps with the exact URL on press', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const r = await render(
    <LocationBubble message={loc} mine={false} label="Vị trí của Bình" />,
  );
  await act(async () =>
    r.root.findByProps({ testID: 'location-open-l1' }).props.onPress(),
  );
  expect(open).toHaveBeenCalledWith(
    'https://www.google.com/maps/search/?api=1&query=21.0285,105.8542',
  );
});

it('swallows openURL failures', async () => {
  jest.spyOn(Linking, 'openURL').mockRejectedValue(new Error('no app'));
  const r = await render(
    <LocationBubble message={loc} mine label="Vị trí của tôi" />,
  );
  await act(async () =>
    r.root.findByProps({ testID: 'location-open-l1' }).props.onPress(),
  );
});

it('does not crash on invalid stored coordinates', async () => {
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const r = await render(
    <LocationBubble
      message={{ ...loc, lat: 999 }}
      mine
      label="Vị trí của tôi"
    />,
  );
  await act(async () =>
    r.root.findByProps({ testID: 'location-open-l1' }).props.onPress(),
  );
  expect(open).not.toHaveBeenCalled();
});

it('MessageBubble renders a location with the right title and alignment', async () => {
  const mineR = await render(
    <MessageBubble message={loc} mine senderName="Bình" />,
  );
  expect(text(mineR)).toContain('Vị trí của tôi');
  const theirs = await render(
    <MessageBubble
      message={{ ...loc, senderId: 'b' }}
      mine={false}
      senderName="Bình"
    />,
  );
  expect(text(theirs)).toContain('Vị trí của Bình');
  const row = (r: ReactTestRenderer.ReactTestRenderer) =>
    Object.assign(
      {},
      ...[r.root.findByProps({ testID: 'row-l1' }).props.style]
        .flat(Infinity)
        .filter(Boolean),
    );
  expect(row(mineR).justifyContent).toBe('flex-end');
  expect(row(theirs).justifyContent).toBe('flex-start');
});

it('pending and failed states are preserved; failed press retries', async () => {
  const onRetry = jest.fn();
  const open = jest.spyOn(Linking, 'openURL').mockResolvedValue(undefined);
  const pend = await render(
    <MessageBubble message={{ ...loc, pending: true }} mine />,
  );
  expect(JSON.stringify(pend.toJSON())).toContain('Đang gửi');
  const fail = await render(
    <MessageBubble message={{ ...loc, failed: true }} mine onRetry={onRetry} />,
  );
  expect(text(fail)).toContain('Gửi lại');
  await act(async () =>
    fail.root
      .findByProps({
        accessibilityLabel: 'Gửi lại',
        accessibilityRole: 'button',
      })
      .props.onPress(),
  );
  expect(onRetry).toHaveBeenCalledWith('l1');
  expect(open).not.toHaveBeenCalled();
});
