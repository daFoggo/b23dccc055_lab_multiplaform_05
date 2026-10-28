import React from 'react';
import { AppState } from 'react-native';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { useMessages } from './use-messages';
import {
  loadOlderMessages,
  markRead,
  newMessageId,
  sendLocationMessage,
  sendTextMessage,
  subscribeMessages,
} from '../../../services/chat-service';
import type { ChatMessage } from '../../../services/types';

jest.mock('../../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../../services/chat-service', () => ({
  subscribeMessages: jest.fn(),
  loadOlderMessages: jest.fn(),
  sendTextMessage: jest.fn(),
  sendLocationMessage: jest.fn(),
  markRead: jest.fn(),
  newMessageId: jest.fn(),
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
  let n = 0;
  (newMessageId as jest.Mock).mockImplementation(() => `srv-${++n}`);
  (markRead as jest.Mock).mockResolvedValue(undefined);
  (sendTextMessage as jest.Mock).mockResolvedValue(undefined);
  (sendLocationMessage as jest.Mock).mockResolvedValue(undefined);
});

it('subscribes once on mount and cleans up exactly once', async () => {
  const { r } = await run();
  expect(subscribeMessages).toHaveBeenCalledTimes(1);
  expect((subscribeMessages as jest.Mock).mock.calls[0][0]).toBe('a_b');
  expect((subscribeMessages as jest.Mock).mock.calls[0][1]).toBe(50);
  await act(async () => r.unmount());
  expect(unsub).toHaveBeenCalledTimes(1);
});

it('after unmount, late subscribe callbacks and send resolution do not set state', async () => {
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  let resolve!: () => void;
  (sendTextMessage as jest.Mock).mockReturnValue(
    new Promise<void>(res => {
      resolve = res;
    }),
  );
  let renders = 0;
  const out: { current?: Result } = {};
  function Probe() {
    renders += 1;
    out.current = useMessages('a_b', 'a', 'b', 'An', 'Bình');
    return null;
  }
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(<Probe />);
  });
  await act(async () => {
    out.current!.send('hi');
  });
  const late = emit;
  await act(async () => r.unmount());
  const before = renders;
  await act(async () => {
    late([msg('m1', 'b', 1000)]);
    resolve();
  });
  expect(renders).toBe(before);
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});

it('remount subscribes once per mount and an old callback never touches the new instance', async () => {
  const first = await run();
  const oldEmit = emit;
  await act(async () => oldEmit([msg('m1', 'b', 1000)]));
  await act(async () => first.r.unmount());
  expect(unsub).toHaveBeenCalledTimes(1);

  const second = await run();
  expect(subscribeMessages).toHaveBeenCalledTimes(2);
  const newEmit = emit;
  expect(messagesOf(second.out.current!)).toHaveLength(0);
  await act(async () => oldEmit([msg('m1', 'b', 1000), msg('m9', 'b', 9000)]));
  expect(messagesOf(second.out.current!)).toHaveLength(0);
  await act(async () => newEmit([msg('m1', 'b', 1000)]));
  expect(messagesOf(second.out.current!).map(m => m.id)).toEqual(['m1']);
  await act(async () => second.r.unmount());
  expect(unsub).toHaveBeenCalledTimes(2);
});

it('does not subscribe without a signed-in uid', async () => {
  const out: { current?: Result } = {};
  function Probe() {
    out.current = useMessages('', '', 'b');
    return null;
  }
  await act(async () => {
    ReactTestRenderer.create(<Probe />);
  });
  expect(subscribeMessages).not.toHaveBeenCalled();
  expect(markRead).not.toHaveBeenCalled();
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
    'srv-1',
  );
});

it('shows a pending item under the server id and keeps it until the echo', async () => {
  const { out } = await run();
  await act(async () => out.current!.send('hi'));
  expect(sendTextMessage).toHaveBeenCalledWith(
    { uid: 'a', name: 'An' },
    { uid: 'b', name: 'Bình' },
    'hi',
    'srv-1',
  );
  // Send resolved but the echo has not arrived: the pending row remains.
  let msgs = messagesOf(out.current!);
  expect(msgs).toHaveLength(1);
  expect(msgs[0]).toMatchObject({ id: 'srv-1', pending: true });
  // Echo arrives with the same id: exactly one row, now the real message.
  await act(async () => emit([msg('srv-1', 'a', Date.now(), 'hi')]));
  msgs = messagesOf(out.current!);
  expect(msgs).toHaveLength(1);
  expect(msgs[0].pending).toBeUndefined();
});

it('two identical messages sent quickly give two distinct rows and no loss', async () => {
  const { out } = await run();
  const t = Date.now();
  await act(async () => {
    out.current!.send('ok');
    out.current!.send('ok');
  });
  expect(messagesOf(out.current!).map(m => m.id)).toEqual(['srv-1', 'srv-2']);
  await act(async () => emit([msg('srv-1', 'a', t, 'ok')]));
  expect(messagesOf(out.current!).map(m => m.id)).toEqual(['srv-1', 'srv-2']);
  await act(async () =>
    emit([msg('srv-1', 'a', t, 'ok'), msg('srv-2', 'a', t + 1, 'ok')]),
  );
  const msgs = messagesOf(out.current!);
  expect(msgs.map(m => m.id)).toEqual(['srv-1', 'srv-2']);
  expect(msgs.every(m => !m.pending)).toBe(true);
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
  expect((sendTextMessage as jest.Mock).mock.calls[1][3]).toBe('srv-1');
  expect(newMessageId).toHaveBeenCalledTimes(1);
  msgs = messagesOf(out.current!);
  expect(msgs).toHaveLength(1);
  expect(msgs[0]).toMatchObject({ id: 'srv-1', pending: true });
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

it('does not call markRead while backgrounded, then marks on return', async () => {
  let listener!: (s: string) => void;
  const spy = jest
    .spyOn(AppState, 'addEventListener')
    .mockImplementation((_t, cb) => {
      listener = cb as (s: string) => void;
      return { remove: jest.fn() } as never;
    });
  await run();
  await act(async () => emit([msg('m1', 'b', 1000)]));
  expect(markRead).toHaveBeenCalledTimes(2);
  await act(async () => listener('background'));
  await act(async () => emit([msg('m1', 'b', 1000), msg('m2', 'b', 2000)]));
  expect(markRead).toHaveBeenCalledTimes(2);
  await act(async () => listener('active'));
  expect(markRead).toHaveBeenCalledTimes(3);
  spy.mockRestore();
});

describe('sendLocation', () => {
  const coords = { lat: 21.0285, lng: 105.8542 };

  it('shows a pending location item then keeps it until the echo', async () => {
    let resolve!: () => void;
    (sendLocationMessage as jest.Mock).mockReturnValue(
      new Promise<void>(res => {
        resolve = res;
      }),
    );
    const { out } = await run();
    await act(async () => {
      out.current!.sendLocation(coords);
    });
    const [m] = messagesOf(out.current!);
    expect(m).toMatchObject({
      id: 'srv-1',
      type: 'location',
      lat: 21.0285,
      lng: 105.8542,
      pending: true,
    });
    expect(sendLocationMessage).toHaveBeenCalledWith(
      { uid: 'a', name: 'An' },
      { uid: 'b', name: 'Bình' },
      coords,
      'srv-1',
    );
    await act(async () => resolve());
    expect(messagesOf(out.current!)[0].pending).toBe(true);
    await act(async () =>
      emit([{ ...m, pending: undefined, createdAt: 5000 }]),
    );
    expect(messagesOf(out.current!)).toHaveLength(1);
    expect(messagesOf(out.current!)[0].pending).toBeUndefined();
  });

  it('marks failed on error and retry resends with the same id', async () => {
    (sendLocationMessage as jest.Mock).mockRejectedValueOnce(new Error('x'));
    const { out } = await run();
    await act(async () => {
      await out.current!.sendLocation(coords);
    });
    expect(messagesOf(out.current!)[0]).toMatchObject({
      type: 'location',
      failed: true,
      pending: false,
    });
    (sendLocationMessage as jest.Mock).mockResolvedValueOnce(undefined);
    await act(async () => {
      await out.current!.retry('srv-1');
    });
    expect(sendLocationMessage).toHaveBeenCalledTimes(2);
    expect((sendLocationMessage as jest.Mock).mock.calls[1][3]).toBe('srv-1');
    expect(sendTextMessage).not.toHaveBeenCalled();
    expect(messagesOf(out.current!)[0]).toMatchObject({
      pending: true,
      failed: false,
    });
  });

  it('ignores invalid coordinates', async () => {
    const { out } = await run();
    await act(async () => {
      await out.current!.sendLocation({ lat: 200, lng: 0 });
    });
    expect(sendLocationMessage).not.toHaveBeenCalled();
    expect(messagesOf(out.current!)).toHaveLength(0);
  });
});
