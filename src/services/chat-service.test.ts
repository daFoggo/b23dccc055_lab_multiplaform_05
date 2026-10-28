import {
  endBefore,
  get,
  limitToLast,
  onValue,
  orderByChild,
  push,
  query,
  ref,
  runTransaction,
  set,
  update,
} from 'firebase/database';
import {
  MAX_MESSAGE_LENGTH,
  loadOlderMessages,
  markRead,
  sendLocationMessage,
  sendTextMessage,
  subscribeConversations,
  subscribeMessages,
} from './chat-service';

jest.mock('./firebase', () => ({ auth: {}, db: {} }));

const me = { uid: 'u2', name: 'Me' };
const peer = { uid: 'u1', name: 'Peer' };
const SV = { '.sv': 'timestamp' };

beforeEach(() => {
  jest.clearAllMocks();
  (push as jest.Mock).mockReturnValue({ key: 'm1' });
  (update as jest.Mock).mockResolvedValue(undefined);
  (runTransaction as jest.Mock).mockResolvedValue(undefined);
  (set as jest.Mock).mockResolvedValue(undefined);
});

describe('sendTextMessage', () => {
  it('multi-path updates once then increments receiver unread', async () => {
    await sendTextMessage(me, peer, '  hello  ');
    expect(push).toHaveBeenCalledWith({ path: 'chats/u1_u2/messages' });
    expect(update).toHaveBeenCalledTimes(1);
    const [, data] = (update as jest.Mock).mock.calls[0];
    expect(data['chats/u1_u2/messages/m1']).toEqual({
      senderId: 'u2',
      type: 'text',
      text: 'hello',
      createdAt: SV,
    });
    expect(data['userChats/u2/u1/peerName']).toBe('Peer');
    expect(data['userChats/u2/u1/lastMessage']).toBe('hello');
    expect(data['userChats/u2/u1/lastType']).toBe('text');
    expect(data['userChats/u2/u1/lastAt']).toEqual(SV);
    expect(data['userChats/u2/u1/unread']).toBe(0);
    expect(data['userChats/u1/u2/peerName']).toBe('Me');
    expect(data['userChats/u1/u2/lastMessage']).toBe('hello');
    expect(data['userChats/u1/u2/unread']).toBeUndefined();
    const keys = Object.keys(data);
    expect(
      keys.every(
        k =>
          k === 'chats/u1_u2/messages/m1' ||
          k.startsWith('userChats/u2/u1/') ||
          k.startsWith('userChats/u1/u2/'),
      ),
    ).toBe(true);
    expect(runTransaction).toHaveBeenCalledTimes(1);
    expect(ref).toHaveBeenCalledWith(
      expect.anything(),
      'userChats/u1/u2/unread',
    );
    const updater = (runTransaction as jest.Mock).mock.calls[0][1];
    expect(updater(null)).toBe(1);
    expect(updater(4)).toBe(5);
    expect((update as jest.Mock).mock.invocationCallOrder[0]).toBeLessThan(
      (runTransaction as jest.Mock).mock.invocationCallOrder[0],
    );
  });

  it('truncates long preview to 200 chars', async () => {
    await sendTextMessage(me, peer, 'x'.repeat(500));
    const [, data] = (update as jest.Mock).mock.calls[0];
    expect(data['userChats/u2/u1/lastMessage']).toHaveLength(200);
    expect(data['chats/u1_u2/messages/m1'].text).toHaveLength(500);
  });

  it('rejects empty text without touching firebase', async () => {
    await expect(sendTextMessage(me, peer, '  ')).rejects.toThrow(
      'Tin nhắn trống',
    );
    expect(push).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it('does not throw if the unread transaction fails', async () => {
    (runTransaction as jest.Mock).mockRejectedValue(new Error('x'));
    await expect(sendTextMessage(me, peer, 'hi')).resolves.toBeUndefined();
  });

  it('propagates update failure and skips transaction', async () => {
    (update as jest.Mock).mockRejectedValue(new Error('denied'));
    await expect(sendTextMessage(me, peer, 'hi')).rejects.toThrow('denied');
    expect(runTransaction).not.toHaveBeenCalled();
  });
});

describe('send limits and preview', () => {
  it('rejects text over 2000 chars before touching firebase', async () => {
    expect(MAX_MESSAGE_LENGTH).toBe(2000);
    await expect(sendTextMessage(me, peer, 'x'.repeat(2001))).rejects.toThrow(
      'Tin nhắn quá dài (tối đa 2000 ký tự)',
    );
    expect(push).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
    await sendTextMessage(me, peer, 'x'.repeat(2000));
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('never splits a surrogate pair at the 200-unit boundary', async () => {
    const text = 'a'.repeat(199) + '😀' + 'b';
    await sendTextMessage(me, peer, text);
    const [, data] = (update as jest.Mock).mock.calls[0];
    expect(data['userChats/u2/u1/lastMessage']).toBe('a'.repeat(199));
  });

  it('keeps preview within 200 UTF-16 units without lone surrogates', async () => {
    await sendTextMessage(me, peer, '😀'.repeat(150));
    const preview = (update as jest.Mock).mock.calls[0][1][
      'userChats/u2/u1/lastMessage'
    ] as string;
    expect(preview.length).toBeLessThanOrEqual(200);
    expect(preview).toBe('😀'.repeat(100));
    expect(Array.from(preview).every(c => c.length === 2)).toBe(true);
  });

  it.each([
    [91, 0],
    [-91, 0],
    [0, 181],
    [0, -181],
    [NaN, 0],
    [0, Infinity],
  ])('rejects invalid location %p,%p', async (lat, lng) => {
    await expect(sendLocationMessage(me, peer, { lat, lng })).rejects.toThrow(
      'Vị trí không hợp lệ',
    );
    expect(push).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });
});

describe('sendLocationMessage', () => {
  it('writes location message and preview', async () => {
    await sendLocationMessage(me, peer, { lat: 21.0285, lng: 105.8542 });
    const [, data] = (update as jest.Mock).mock.calls[0];
    expect(data['chats/u1_u2/messages/m1']).toEqual({
      senderId: 'u2',
      type: 'location',
      lat: 21.0285,
      lng: 105.8542,
      createdAt: SV,
    });
    expect(data['userChats/u1/u2/lastType']).toBe('location');
    expect(data['userChats/u1/u2/lastMessage']).toBe('📍 Vị trí');
    expect(runTransaction).toHaveBeenCalledTimes(1);
  });
});

describe('subscribeMessages / loadOlderMessages', () => {
  const snap = (obj: Record<string, unknown> | null) => ({
    exists: () => obj !== null,
    val: () => obj,
  });

  it('queries last N by createdAt, maps ascending, null createdAt fallback', () => {
    (query as jest.Mock).mockReturnValue('Q');
    (orderByChild as jest.Mock).mockReturnValue('O');
    (limitToLast as jest.Mock).mockReturnValue('L');
    let handler: (s: unknown) => void = () => {};
    const detach = jest.fn();
    (onValue as jest.Mock).mockImplementation((_q, cb) => {
      handler = cb;
      return detach;
    });
    const cb = jest.fn();
    const unsub = subscribeMessages('u1_u2', 30, cb);
    expect(query).toHaveBeenCalledWith(
      { path: 'chats/u1_u2/messages' },
      'O',
      'L',
    );
    expect(orderByChild).toHaveBeenCalledWith('createdAt');
    expect(limitToLast).toHaveBeenCalledWith(30);
    const spy = jest.spyOn(Date, 'now').mockReturnValue(999);
    handler(
      snap({
        b: { senderId: 'u1', type: 'text', text: 'b', createdAt: 20 },
        a: { senderId: 'u2', type: 'text', text: 'a', createdAt: 10 },
        c: { senderId: 'u2', type: 'location', lat: 1, lng: 2 },
      }),
    );
    spy.mockRestore();
    expect(cb).toHaveBeenCalledWith([
      { id: 'a', senderId: 'u2', type: 'text', text: 'a', createdAt: 10 },
      { id: 'b', senderId: 'u1', type: 'text', text: 'b', createdAt: 20 },
      {
        id: 'c',
        senderId: 'u2',
        type: 'location',
        lat: 1,
        lng: 2,
        createdAt: 999,
      },
    ]);
    handler(snap(null));
    expect(cb).toHaveBeenLastCalledWith([]);
    unsub();
    expect(detach).toHaveBeenCalledTimes(1);
    cb.mockClear();
    handler(snap({}));
    expect(cb).not.toHaveBeenCalled();
  });

  it('loadOlderMessages uses endBefore + limitToLast, returns ascending', async () => {
    (get as jest.Mock).mockResolvedValue(
      snap({
        y: { senderId: 'u1', type: 'text', text: 'y', createdAt: 5 },
        x: { senderId: 'u1', type: 'text', text: 'x', createdAt: 3 },
      }),
    );
    const res = await loadOlderMessages('u1_u2', 100, 30);
    expect(endBefore).toHaveBeenCalledWith(100);
    expect(limitToLast).toHaveBeenCalledWith(30);
    expect(res.map(m => m.id)).toEqual(['x', 'y']);
  });
});

describe('ordering and pagination keys', () => {
  it('sorts ties on createdAt by id', () => {
    let handler: (s: unknown) => void = () => {};
    (onValue as jest.Mock).mockImplementation((_q, cb) => {
      handler = cb;
      return jest.fn();
    });
    const cb = jest.fn();
    subscribeMessages('u1_u2', 30, cb);
    handler({
      val: () => ({
        z: { senderId: 'u1', type: 'text', text: 'z', createdAt: 5 },
        a: { senderId: 'u1', type: 'text', text: 'a', createdAt: 5 },
        m: { senderId: 'u1', type: 'text', text: 'm', createdAt: 5 },
      }),
    });
    expect(cb.mock.calls[0][0].map((m: { id: string }) => m.id)).toEqual([
      'a',
      'm',
      'z',
    ]);
  });

  it('loadOlderMessages passes beforeKey to endBefore and orders query args', async () => {
    (get as jest.Mock).mockResolvedValue({ val: () => null });
    (query as jest.Mock).mockReturnValue('Q');
    (orderByChild as jest.Mock).mockReturnValue('O');
    (endBefore as jest.Mock).mockReturnValue('E');
    (limitToLast as jest.Mock).mockReturnValue('L');
    await loadOlderMessages('u1_u2', 100, 30, 'k9');
    expect(endBefore).toHaveBeenCalledWith(100, 'k9');
    expect(query).toHaveBeenCalledWith(
      { path: 'chats/u1_u2/messages' },
      'O',
      'E',
      'L',
    );
  });
});

describe('subscribeConversations', () => {
  it('sorts latest first, default unread 0, detaches', () => {
    let handler: (s: unknown) => void = () => {};
    const detach = jest.fn();
    (onValue as jest.Mock).mockImplementation((_r, cb) => {
      handler = cb;
      return detach;
    });
    const cb = jest.fn();
    const unsub = subscribeConversations('u2', cb);
    expect(ref).toHaveBeenCalledWith(expect.anything(), 'userChats/u2');
    handler({
      val: () => ({
        p1: { peerName: 'A', lastMessage: 'x', lastType: 'text', lastAt: 1 },
        p2: {
          peerName: 'B',
          lastMessage: 'y',
          lastType: 'location',
          lastAt: 9,
          unread: 3,
        },
      }),
    });
    expect(cb).toHaveBeenCalledWith([
      {
        peerId: 'p2',
        peerName: 'B',
        lastMessage: 'y',
        lastType: 'location',
        lastAt: 9,
        unread: 3,
      },
      {
        peerId: 'p1',
        peerName: 'A',
        lastMessage: 'x',
        lastType: 'text',
        lastAt: 1,
        unread: 0,
      },
    ]);
    unsub();
    expect(detach).toHaveBeenCalledTimes(1);
  });
});

describe('markRead', () => {
  it('sets unread to 0 when unread > 0', async () => {
    (get as jest.Mock).mockResolvedValue({
      exists: () => true,
      val: () => ({ unread: 2 }),
    });
    await markRead('u2', 'u1');
    expect(set).toHaveBeenCalledWith({ path: 'userChats/u2/u1/unread' }, 0);
  });

  it('is a no-op when node is missing or unread is 0', async () => {
    (get as jest.Mock).mockResolvedValue({
      exists: () => false,
      val: () => null,
    });
    await markRead('u2', 'u1');
    (get as jest.Mock).mockResolvedValue({
      exists: () => true,
      val: () => ({ unread: 0 }),
    });
    await markRead('u2', 'u1');
    expect(set).not.toHaveBeenCalled();
  });
});
