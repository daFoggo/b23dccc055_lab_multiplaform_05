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
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import { getChatId } from '../lib/chat-id';
import { canSend } from '../lib/messages';
import { db } from './firebase';
import type {
  ChatMessage,
  ConversationSummary,
  MessageType,
  Unsubscribe,
} from './types';

export type Party = { uid: string; name: string };

const PREVIEW_MAX = 200;
const LOCATION_PREVIEW = '📍 Vị trí';

type RawMessage = {
  senderId?: string;
  type?: MessageType;
  text?: string;
  lat?: number;
  lng?: number;
  createdAt?: number | null;
};

type RawConversation = {
  peerName?: string;
  lastMessage?: string;
  lastType?: MessageType;
  lastAt?: number;
  unread?: number;
};

function toMessage(id: string, raw: RawMessage): ChatMessage {
  const message: ChatMessage = {
    id,
    senderId: raw.senderId ?? '',
    type: raw.type === 'location' ? 'location' : 'text',
    // A local pending write may report createdAt as null until the server
    // timestamp resolves; fall back so ordering/rendering never breaks.
    createdAt: typeof raw.createdAt === 'number' ? raw.createdAt : Date.now(),
  };
  if (raw.text !== undefined) {
    message.text = raw.text;
  }
  if (raw.lat !== undefined) {
    message.lat = raw.lat;
  }
  if (raw.lng !== undefined) {
    message.lng = raw.lng;
  }
  return message;
}

function toMessages(val: Record<string, RawMessage> | null): ChatMessage[] {
  return Object.entries(val ?? {})
    .map(([id, raw]) => toMessage(id, raw))
    .sort((a, b) => a.createdAt - b.createdAt);
}

function guardError(isActive: () => boolean, onError?: (e: Error) => void) {
  return (e: Error) => {
    if (isActive()) {
      onError?.(e);
    }
  };
}

type Payload = {
  message: Record<string, unknown>;
  lastMessage: string;
  lastType: MessageType;
};

// Single atomic multi-path update (message + both userChats nodes), written
// field by field so the receiver's existing `unread` is never overwritten.
// The sender's own unread is reset to 0. The receiver's unread is then bumped
// by a transaction AFTER the update commits; if that fails the message is
// already delivered, so the error is swallowed (no throw out of send).
async function send(me: Party, peer: Party, payload: Payload): Promise<void> {
  const chatId = getChatId(me.uid, peer.uid);
  const key = push(ref(db, `chats/${chatId}/messages`)).key;
  const mine = `userChats/${me.uid}/${peer.uid}`;
  const theirs = `userChats/${peer.uid}/${me.uid}`;
  await update(ref(db), {
    [`chats/${chatId}/messages/${key}`]: payload.message,
    [`${mine}/peerName`]: peer.name,
    [`${mine}/lastMessage`]: payload.lastMessage,
    [`${mine}/lastType`]: payload.lastType,
    [`${mine}/lastAt`]: serverTimestamp(),
    [`${mine}/unread`]: 0,
    [`${theirs}/peerName`]: me.name,
    [`${theirs}/lastMessage`]: payload.lastMessage,
    [`${theirs}/lastType`]: payload.lastType,
    [`${theirs}/lastAt`]: serverTimestamp(),
  });
  try {
    await runTransaction(ref(db, `${theirs}/unread`), current =>
      ((current as number | null) ?? 0) + 1,
    );
  } catch {
    // Intentionally ignored: see comment above.
  }
}

export async function sendTextMessage(
  me: Party,
  peer: Party,
  text: string,
): Promise<void> {
  if (!canSend(text)) {
    throw new Error('Tin nhắn trống');
  }
  const trimmed = text.trim();
  await send(me, peer, {
    message: {
      senderId: me.uid,
      type: 'text',
      text: trimmed,
      createdAt: serverTimestamp(),
    },
    lastMessage: trimmed.slice(0, PREVIEW_MAX),
    lastType: 'text',
  });
}

export async function sendLocationMessage(
  me: Party,
  peer: Party,
  coords: { lat: number; lng: number },
): Promise<void> {
  await send(me, peer, {
    message: {
      senderId: me.uid,
      type: 'location',
      lat: coords.lat,
      lng: coords.lng,
      createdAt: serverTimestamp(),
    },
    lastMessage: LOCATION_PREVIEW,
    lastType: 'location',
  });
}

export function subscribeMessages(
  chatId: string,
  limit: number,
  cb: (m: ChatMessage[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  let active = true;
  const detach = onValue(
    query(
      ref(db, `chats/${chatId}/messages`),
      orderByChild('createdAt'),
      limitToLast(limit),
    ),
    snapshot => {
      if (!active) {
        return;
      }
      cb(toMessages(snapshot.val() as Record<string, RawMessage> | null));
    },
    guardError(() => active, onError),
  );
  return () => {
    active = false;
    detach();
  };
}

export async function loadOlderMessages(
  chatId: string,
  beforeCreatedAt: number,
  limit: number,
): Promise<ChatMessage[]> {
  const snapshot = await get(
    query(
      ref(db, `chats/${chatId}/messages`),
      orderByChild('createdAt'),
      endBefore(beforeCreatedAt),
      limitToLast(limit),
    ),
  );
  return toMessages(snapshot.val() as Record<string, RawMessage> | null);
}

export function subscribeConversations(
  uid: string,
  cb: (c: ConversationSummary[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  let active = true;
  const detach = onValue(
    ref(db, `userChats/${uid}`),
    snapshot => {
      if (!active) {
        return;
      }
      const val = (snapshot.val() ?? {}) as Record<string, RawConversation>;
      const list = Object.entries(val)
        .map(
          ([peerId, raw]): ConversationSummary => ({
            peerId,
            peerName: raw.peerName ?? '',
            lastMessage: raw.lastMessage ?? '',
            lastType: raw.lastType === 'location' ? 'location' : 'text',
            lastAt: raw.lastAt ?? 0,
            unread: raw.unread ?? 0,
          }),
        )
        .sort((a, b) => b.lastAt - a.lastAt);
      cb(list);
    },
    guardError(() => active, onError),
  );
  return () => {
    active = false;
    detach();
  };
}

// No-op when the node is missing (rules reject a partial node) or already read.
export async function markRead(uid: string, peerId: string): Promise<void> {
  const node = `userChats/${uid}/${peerId}`;
  const snapshot = await get(ref(db, node));
  if (!snapshot.exists()) {
    return;
  }
  const unread = (snapshot.val() as RawConversation).unread ?? 0;
  if (unread > 0) {
    await set(ref(db, `${node}/unread`), 0);
  }
}
