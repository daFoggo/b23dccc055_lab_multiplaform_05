import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { useMessages } from './use-messages';
import {
  loadOlderMessages,
  markRead,
  sendTextMessage,
  subscribeMessages,
} from '../../../services/chat-service';
import type { ChatMessage } from '../../../services/types';

jest.mock('../../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../../services/chat-service', () => ({
  subscribeMessages: jest.fn(),
  loadOlderMessages: jest.fn(),
  sendTextMessage: jest.fn(),
  markRead: jest.fn(),
}));

type Result = ReturnType<typeof useMessages>;

const msg = (
  id: string,
  senderId: string,
  createdAt: number,
  text = id,
): ChatMessage => ({ id, senderId, type: 'text', text, createdAt });

let emit: (m: ChatMessage[]) => void;
let unsub: jest.Mock;

function messagesOf(r: Result) {
  return r.items.flatMap(i => (i.type === 'message' ? [i.message] : []));
}

async function run() {
  const out: { current?: Result } = {};
  function Probe() {
    out.current = useMessages('a_b', 'a', 'b', 'An', 'Bình');
    return null;
  }
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(<Probe />);
  });
  return { out, r };
}

beforeEach(() => {
  jest.clearAllMocks();
  unsub = jest.fn();
  (subscribeMessages as jest.Mock).mockImplementation((_c, _l, cb) => {
    emit = cb;
    return unsub;
  });
  (markRead as jest.Mock).mockResolvedValue(undefined);
  (sendTextMessage as jest.Mock).mockResolvedValue(undefined);
});

it('subscribes once on mount and cleans up exactly once', async () => {
  const { r } = await run();
  expect(subscribeMessages).toHaveBeenCalledTimes(1);
  expect((subscribeMessages as jest.Mock).mock.calls[0][0]).toBe('a_b');
  expect((subscribeMessages as jest.Mock).mock.calls[0][1]).toBe(50);
  await act(async () => r.unmount());
  expect(unsub).toHaveBeenCalledTimes(1);
});

it('ignores callbacks after unmount', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const { out, r } = await run();
  await act(async () => emit([msg('m1', 'b', 1000)]));
  await act(async () => r.unmount());
  await act(async () => emit([msg('m1', 'b', 1000), msg('m2', 'b', 2000)]));
  expect(messagesOf(out.current!)).toHaveLength(1);
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});

it('does not duplicate messages after remounting twice', async () => {
  for (let i = 0; i < 2; i++) {
    const { out, r } = await run();
    await act(async () => emit([msg('m1', 'b', 1000), msg('m2', 'a', 2000)]));
    expect(messagesOf(out.current!)).toHaveLength(2);
    await act(async () => r.unmount());
  }
  const { out } = await run();
  await act(async () => emit([msg('m1', 'b', 1000), msg('m2', 'a', 2000)]));
  expect(messagesOf(out.current!)).toHaveLength(2);
  expect(subscribeMessages).toHaveBeenCalledTimes(3);
});

it('trims on send and does not call the service for empty text', async () => {
  const { out } = await run();
  await act(async () => out.current!.send('   \n '));
  expect(sendTextMessage).not.toHaveBeenCalled();
  await act(async () => out.current!.send('  chào  '));
  expect(sendTextMessage).toHaveBeenCalledWith(
    { uid: 'a', name: 'An' },
    { uid: 'b', name: 'Bình' },
    'chào',
  );
});

it('shows an optimistic pending message, then no duplicate once the server one arrives', async () => {
  let resolve!: () => void;
  (sendTextMessage as jest.Mock).mockReturnValue(
    new Promise<void>(res => {
      resolve = res;
    }),
  );
  const { out } = await run();
  await act(async () => {
    out.current!.send('hi');
  });
  let msgs = messagesOf(out.current!);
  expect(msgs).toHaveLength(1);
  expect(msgs[0].pending).toBe(true);
  expect(msgs[0].id).toMatch(/^local-/);

  // Server echo arrives first (Firebase local event), then the promise resolves.
  await act(async () => emit([msg('s1', 'a', Date.now(), 'hi')]));
  msgs = messagesOf(out.current!);
  expect(msgs).toHaveLength(1);
  expect(msgs[0].id).toBe('s1');
  await act(async () => resolve());
  msgs = messagesOf(out.current!);
  expect(msgs).toHaveLength(1);
  expect(msgs[0].pending).toBeUndefined();
});

it('drops the pending item when the send resolves before the echo', async () => {
  const { out } = await run();
  await act(async () => out.current!.send('hi'));
  expect(messagesOf(out.current!)).toHaveLength(0);
});

it('marks a failed send and retries it', async () => {
  (sendTextMessage as jest.Mock).mockRejectedValueOnce(new Error('x'));
  const { out } = await run();
  await act(async () => out.current!.send('hi'));
  let msgs = messagesOf(out.current!);
  expect(msgs).toHaveLength(1);
  expect(msgs[0].failed).toBe(true);
  expect(msgs[0].pending).toBeFalsy();

  await act(async () => out.current!.retry(msgs[0].id));
  expect(sendTextMessage).toHaveBeenCalledTimes(2);
  msgs = messagesOf(out.current!);
  expect(msgs).toHaveLength(0);
});

it('calls markRead on open and once per new peer message id', async () => {
  await run();
  expect(markRead).toHaveBeenCalledTimes(1);
  expect(markRead).toHaveBeenCalledWith('a', 'b');
  await act(async () => emit([msg('m1', 'b', 1000)]));
  expect(markRead).toHaveBeenCalledTimes(2);
  await act(async () => emit([msg('m1', 'b', 1000), msg('m2', 'a', 1500)]));
  expect(markRead).toHaveBeenCalledTimes(2);
  await act(async () => emit([msg('m1', 'b', 1000), msg('m3', 'b', 2000)]));
  expect(markRead).toHaveBeenCalledTimes(3);
});

it('loads older messages with the oldest createdAt and id, never concurrently', async () => {
  const { out } = await run();
  await act(async () => emit([msg('m5', 'b', 5000), msg('m6', 'a', 6000)]));
  let resolve!: (m: ChatMessage[]) => void;
  (loadOlderMessages as jest.Mock).mockReturnValue(
    new Promise<ChatMessage[]>(res => {
      resolve = res;
    }),
  );
  await act(async () => {
    out.current!.loadOlder();
    out.current!.loadOlder();
  });
  expect(loadOlderMessages).toHaveBeenCalledTimes(1);
  expect(loadOlderMessages).toHaveBeenCalledWith('a_b', 5000, 30, 'm5');
  await act(async () => resolve([msg('m4', 'b', 4000)]));
  expect(messagesOf(out.current!).map(m => m.id)).toEqual(['m4', 'm5', 'm6']);
});
