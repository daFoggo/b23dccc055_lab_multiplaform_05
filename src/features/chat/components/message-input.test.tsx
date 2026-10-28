import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import { MessageInput } from './message-input';
import { paperTheme } from '../../../theme/paper-theme';

jest.mock('../../../services/firebase', () => ({ auth: {}, db: {} }));

const mounted: ReactTestRenderer.ReactTestRenderer[] = [];

afterEach(async () => {
  for (const r of mounted.splice(0)) {
    await act(async () => r.unmount());
  }
});

async function render(ui: React.ReactElement) {
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <PaperProvider theme={paperTheme}>{ui}</PaperProvider>,
    );
  });
  mounted.push(r);
  return r;
}

const input = (r: ReactTestRenderer.ReactTestRenderer) =>
  r.root.findAllByProps({ testID: 'message-input' })[0];
const sendBtn = (r: ReactTestRenderer.ReactTestRenderer) =>
  r.root.findAllByProps({ testID: 'send-button' })[0];

it('disables send for whitespace-only text and does not send', async () => {
  const onSend = jest.fn();
  const r = await render(<MessageInput onSend={onSend} />);
  await act(async () => input(r).props.onChangeText('  \n '));
  expect(sendBtn(r).props.disabled).toBe(true);
  await act(async () => sendBtn(r).props.onPress?.());
  expect(onSend).not.toHaveBeenCalled();
});

it('sends and clears when there is text', async () => {
  const onSend = jest.fn();
  const r = await render(<MessageInput onSend={onSend} />);
  await act(async () => input(r).props.onChangeText('hi'));
  expect(sendBtn(r).props.disabled).toBe(false);
  await act(async () => sendBtn(r).props.onPress());
  expect(onSend).toHaveBeenCalledWith('hi');
  expect(input(r).props.value).toBe('');
});

it('renders the location button only when a handler is given', async () => {
  const none = await render(<MessageInput onSend={jest.fn()} />);
  expect(none.root.findAllByProps({ testID: 'location-button' })).toHaveLength(
    0,
  );
  const some = await render(
    <MessageInput onSend={jest.fn()} onPressLocation={jest.fn()} />,
  );
  expect(
    some.root.findAllByProps({ testID: 'location-button' }).length,
  ).toBeGreaterThan(0);
});
