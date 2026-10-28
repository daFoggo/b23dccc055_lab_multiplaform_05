import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { PaperProvider } from 'react-native-paper';
import { MessageBubble } from './message-bubble';
import { formatTime } from '../../../lib/format-time';
import { paperTheme } from '../../../theme/paper-theme';
import { colors } from '../../../theme/colors';
import type { ChatMessage } from '../../../services/types';

const base: ChatMessage = {
  id: 'm1',
  senderId: 'a',
  type: 'text',
  text: 'Xin chào',
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

const flat = (style: unknown): Record<string, unknown> =>
  Object.assign({}, ...[style].flat(Infinity).filter(Boolean));

it('aligns my bubble right with the mine colour and shows the time', async () => {
  const r = await render(<MessageBubble message={base} mine />);
  const row = r.root.findByProps({ testID: 'row-m1' });
  expect(flat(row.props.style).justifyContent).toBe('flex-end');
  const bubble = r.root.findAllByProps({ testID: 'bubble-m1' })[0];
  expect(flat(bubble.props.style).backgroundColor).toBe(colors.bubbleMine);
  expect(JSON.stringify(r.toJSON())).toContain(formatTime(base.createdAt));
});

it('aligns the other bubble left with the other colour', async () => {
  const r = await render(<MessageBubble message={base} mine={false} />);
  const row = r.root.findByProps({ testID: 'row-m1' });
  expect(flat(row.props.style).justifyContent).toBe('flex-start');
  const bubble = r.root.findAllByProps({ testID: 'bubble-m1' })[0];
  expect(flat(bubble.props.style).backgroundColor).toBe(colors.bubbleOther);
});

it('shows the retry label for a failed message and retries on press', async () => {
  const onRetry = jest.fn();
  const r = await render(
    <MessageBubble message={{ ...base, failed: true }} mine onRetry={onRetry} />,
  );
  expect(JSON.stringify(r.toJSON())).toContain('Gửi lại');
  const btn = r.root.findAllByProps({ accessibilityLabel: 'Gửi lại' })[0];
  await act(async () => btn.props.onPress());
  expect(onRetry).toHaveBeenCalledWith('m1');
});
