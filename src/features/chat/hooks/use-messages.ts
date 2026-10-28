import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  loadOlderMessages,
  markRead,
  sendTextMessage,
  subscribeMessages,
} from '../../../services/chat-service';
import { canSend, groupByDay } from '../../../lib/messages';
import type { ChatMessage } from '../../../services/types';

const INITIAL_LIMIT = 50;
const PAGE_SIZE = 30;
// A server echo of our own send is matched to its pending item when it is
// not older than the pending item (minus a little clock skew).
const ECHO_SKEW_MS = 5000;

const byTime = (a: ChatMessage, b: ChatMessage) =>
  a.createdAt - b.createdAt || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);

export function useMessages(
  chatId: string,
  myUid: string,
  peerId: string,
  myName = '',
  peerName = '',
) {
  const [live, setLive] = useState<ChatMessage[]>([]);
  const [older, setOlder] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState<ChatMessage[]>([]);
  const mounted = useRef(true);
  const counter = useRef(0);
  const loadingOlder = useRef(false);
  const exhausted = useRef(false);
  const readFor = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    mounted.current = true;
    const unsubscribe = subscribeMessages(chatId, INITIAL_LIMIT, messages => {
      if (mounted.current) {
        setLive(messages);
      }
    });
    return () => {
      mounted.current = false;
      unsubscribe();
    };
  }, [chatId]);

  const server = useMemo(() => {
    const map = new Map<string, ChatMessage>();
    for (const m of older) {
      map.set(m.id, m);
    }
    for (const m of live) {
      map.set(m.id, m);
    }
    return [...map.values()].sort(byTime);
  }, [older, live]);

  // Mark read on open and whenever the latest peer message changes.
  const latestPeerId = useMemo(() => {
    for (let i = server.length - 1; i >= 0; i--) {
      if (server[i].senderId === peerId) {
        return server[i].id;
      }
    }
    return null;
  }, [server, peerId]);

  useEffect(() => {
    if (readFor.current === latestPeerId) {
      return;
    }
    readFor.current = latestPeerId;
    markRead(myUid, peerId).catch(() => {});
  }, [latestPeerId, myUid, peerId]);

  const items = useMemo(() => {
    // Hide pending items already echoed by the server (one-to-one match).
    const unmatched = new Set(pending.map(p => p.id));
    const mine = server.filter(m => m.senderId === myUid);
    const used = new Set<string>();
    for (const p of pending) {
      if (p.failed) {
        continue;
      }
      const echo = mine.find(
        m =>
          !used.has(m.id) &&
          m.text === p.text &&
          m.createdAt >= p.createdAt - ECHO_SKEW_MS,
      );
      if (echo) {
        used.add(echo.id);
        unmatched.delete(p.id);
      }
    }
    const visible = pending.filter(p => unmatched.has(p.id));
    return groupByDay([...server, ...visible], Date.now());
  }, [server, pending, myUid]);

  const loadOlder = useCallback(async () => {
    if (loadingOlder.current || exhausted.current || server.length === 0) {
      return;
    }
    loadingOlder.current = true;
    try {
      const oldest = server[0];
      const page = await loadOlderMessages(
        chatId,
        oldest.createdAt,
        PAGE_SIZE,
        oldest.id,
      );
      if (!mounted.current) {
        return;
      }
      if (page.length < PAGE_SIZE) {
        exhausted.current = true;
      }
      setOlder(prev => [...prev, ...page]);
    } catch {
      // Keep the list as is; the next end-reached will retry.
    } finally {
      loadingOlder.current = false;
    }
  }, [chatId, server]);

  const deliver = useCallback(
    async (localId: string, text: string) => {
      try {
        await sendTextMessage(
          { uid: myUid, name: myName },
          { uid: peerId, name: peerName },
          text,
        );
        // The realtime listener delivers the real message; drop the local one.
        if (mounted.current) {
          setPending(prev => prev.filter(p => p.id !== localId));
        }
      } catch {
        if (mounted.current) {
          setPending(prev =>
            prev.map(p =>
              p.id === localId ? { ...p, pending: false, failed: true } : p,
            ),
          );
        }
      }
    },
    [myUid, myName, peerId, peerName],
  );

  const send = useCallback(
    async (text: string) => {
      if (!canSend(text)) {
        return;
      }
      const trimmed = text.trim();
      counter.current += 1;
      const localId = `local-${counter.current}`;
      setPending(prev => [
        ...prev,
        {
          id: localId,
          senderId: myUid,
          type: 'text',
          text: trimmed,
          createdAt: Date.now(),
          pending: true,
        },
      ]);
      await deliver(localId, trimmed);
    },
    [myUid, deliver],
  );

  const retry = useCallback(
    async (localId: string) => {
      const target = pending.find(p => p.id === localId && p.failed);
      if (!target || target.text === undefined) {
        return;
      }
      setPending(prev =>
        prev.map(p =>
          p.id === localId
            ? { ...p, pending: true, failed: false, createdAt: Date.now() }
            : p,
        ),
      );
      await deliver(localId, target.text);
    },
    [pending, deliver],
  );

  return { items, loadOlder, send, retry };
}
