import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import { useConversations } from './use-conversations';
import { subscribeConversations } from '../../../services/chat-service';

jest.mock('../../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../../services/chat-service', () => ({
  subscribeConversations: jest.fn(),
}));

type Result = ReturnType<typeof useConversations>;

const conv = (peerId: string, unread: number, lastAt = 1000) => ({
  peerId,
  peerName: peerId,
  lastMessage: 'hi',
  lastType: 'text' as const,
  lastAt,
  unread,
});

async function run(uid: string) {
  const out: { current?: Result } = {};
  function Probe() {
    out.current = useConversations(uid);
    return null;
  }
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(<Probe />);
  });
  return { out, r };
}

beforeEach(() => (subscribeConversations as jest.Mock).mockReset());

it('does not subscribe for an empty uid', async () => {
  const { out } = await run('');
  expect(subscribeConversations).not.toHaveBeenCalled();
  expect(out.current).toEqual({
    conversations: [],
    totalUnread: 0,
    loading: false,
    error: undefined,
  });
});

it('is loading until the first snapshot', async () => {
  (subscribeConversations as jest.Mock).mockReturnValue(jest.fn());
  const { out } = await run('me');
  expect(out.current?.loading).toBe(true);
});

it('sums unread, updates live, and unsubscribes exactly once', async () => {
  const unsub = jest.fn();
  let push!: (c: ReturnType<typeof conv>[]) => void;
  (subscribeConversations as jest.Mock).mockImplementation((_u, cb) => {
    push = cb;
    return unsub;
  });
  const { out, r } = await run('me');
  await act(async () => push([conv('a', 3), conv('b', 2)]));
  expect(out.current?.totalUnread).toBe(5);
  expect(out.current?.loading).toBe(false);
  await act(async () => push([conv('a', 4), conv('b', 2)]));
  expect(out.current?.totalUnread).toBe(6);
  await act(async () => push([conv('a', 0), conv('b', 2)]));
  expect(out.current?.totalUnread).toBe(2);
  await act(async () => r.unmount());
  expect(unsub).toHaveBeenCalledTimes(1);
});

it('filters self and entries lacking lastAt', async () => {
  (subscribeConversations as jest.Mock).mockImplementation((_u, cb) => {
    cb([conv('me', 5), conv('a', 1, 0), conv('b', 2, 50)]);
    return jest.fn();
  });
  const { out } = await run('me');
  expect(out.current?.conversations.map(c => c.peerId)).toEqual(['b']);
  expect(out.current?.totalUnread).toBe(2);
});

it('sets error on listener failure', async () => {
  (subscribeConversations as jest.Mock).mockImplementation(
    (_u, _cb, onError) => {
      onError(new Error('denied'));
      return jest.fn();
    },
  );
  const { out } = await run('me');
  expect(out.current?.loading).toBe(false);
  expect(out.current?.error).toBe('Không tải được danh sách trò chuyện');
});

it('ignores callbacks after unmount', async () => {
  let push!: (c: ReturnType<typeof conv>[]) => void;
  (subscribeConversations as jest.Mock).mockImplementation((_u, cb) => {
    push = cb;
    return jest.fn();
  });
  const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const { r } = await run('me');
  await act(async () => r.unmount());
  await act(async () => push([conv('a', 1)]));
  expect(spy).not.toHaveBeenCalled();
  spy.mockRestore();
});

it('does not expose the previous user data after the uid changes', async () => {
  let emit!: (l: unknown[]) => void;
  (subscribeConversations as jest.Mock).mockImplementation((_uid, cb) => {
    emit = cb;
    return jest.fn();
  });
  const seen: Result[] = [];
  function Probe({ uid }: { uid: string }) {
    const value = useConversations(uid);
    seen.push(value);
    return null;
  }
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(<Probe uid="a" />);
  });
  await act(async () => emit([conv('x', 2)]));
  seen.length = 0;
  await act(async () => r.update(<Probe uid="b" />));
  expect(seen[0].conversations).toEqual([]);
  expect(seen[0].totalUnread).toBe(0);
  expect(seen[0].loading).toBe(true);
});
