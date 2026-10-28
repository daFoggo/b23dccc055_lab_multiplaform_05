import React from 'react';
import ReactTestRenderer, { act } from 'react-test-renderer';
import {
  ConversationsProvider,
  useConversationsContext,
} from './conversations-context';
import { subscribeConversations } from '../../services/chat-service';

jest.mock('../../services/firebase', () => ({ auth: {}, db: {} }));
jest.mock('../../services/chat-service', () => ({
  subscribeConversations: jest.fn(),
}));
jest.mock('../auth/auth-context', () => ({
  useAuth: () => ({ user: { uid: 'me' }, initializing: false }),
}));

const conv = (peerId: string, unread: number) => ({
  peerId,
  peerName: peerId,
  lastMessage: 'x',
  lastType: 'text' as const,
  lastAt: 10,
  unread,
});

it('shares one subscription; unread 3 then 0 updates totals for all consumers', async () => {
  let push!: (c: ReturnType<typeof conv>[]) => void;
  const unsub = jest.fn();
  (subscribeConversations as jest.Mock).mockImplementation((_u, cb) => {
    push = cb;
    return unsub;
  });
  const seen: { a?: number; b?: number } = {};
  function A() {
    seen.a = useConversationsContext().totalUnread;
    return null;
  }
  function B() {
    seen.b = useConversationsContext().totalUnread;
    return null;
  }
  let r!: ReactTestRenderer.ReactTestRenderer;
  await act(async () => {
    r = ReactTestRenderer.create(
      <ConversationsProvider>
        <A />
        <B />
      </ConversationsProvider>,
    );
  });
  expect(subscribeConversations).toHaveBeenCalledTimes(1);
  await act(async () => push([conv('p', 3)]));
  expect(seen).toEqual({ a: 3, b: 3 });
  await act(async () => push([conv('p', 0)]));
  expect(seen).toEqual({ a: 0, b: 0 });
  await act(async () => r.unmount());
  expect(unsub).toHaveBeenCalledTimes(1);
});
