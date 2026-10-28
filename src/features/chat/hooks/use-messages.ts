import { AppState } from 'react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  loadOlderMessages,
  markRead,
  newMessageId,
  sendTextMessage,
  subscribeMessages,
} from '../../../services/chat-service';
import { canSend, groupByDay } from '../../../lib/messages';
import type { ChatMessage } from '../../../services/types';

const INITIAL_LIMIT = 50;
const PAGE_SIZE = 30;

const isForeground = (state: string) =>
  state !== 'background' && state !== 'inactive';

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
  const loadingOlder = useRef(false);
  const exhausted = useRef(false);
  const readFor = useRef<string | null | undefined>(undefined);

  const pendingRef = useRef<ChatMessage[]>([]);
  pendingRef.current = pending;
  const [foreground, setForeground] = useState(() =>
    isForeground(AppState.currentState ?? 'active'),
  );

  useEffect(() => {
    const sub = AppState.addEventListener('change', state =>
      setForeground(isForeground(state)),
    );
    return () => sub.remove();
  }, []);

  useEffect(() => {
    mounted.current = true;
    if (!myUid) {
      return undefined;
    }
    let active = true;
    const unsubscribe = subscribeMessages(chatId, INITIAL_LIMIT, messages => {
      if (active) {
        setLive(messages);
      }
    });
    return () => {
      active = false;
      mounted.current = false;
      unsubscribe();
    };
  }, [chatId, myUid]);

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
    if (!myUid || !foreground || readFor.current === latestPeerId) {
      return;
    }
    readFor.current = latestPeerId;
    markRead(myUid, peerId).catch(() => {});
  }, [latestPeerId, myUid, peerId, foreground]);

  // A pending item is shown until the server message with the same id arrives.
  const items = useMemo(() => {
    const ids = new Set(server.map(m => m.id));
    const visible = pending.filter(p => !ids.has(p.id));
    return groupByDay([...server, ...visible], Date.now());
  }, [server, pending]);

  // Prune pending items that the server has already echoed.
  useEffect(() => {
    const ids = new Set(server.map(m => m.id));
    if (pendingRef.current.some(p => ids.has(p.id))) {
      setPending(prev => prev.filter(p => !ids.has(p.id)));
    }
  }, [server]);

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
    async (id: string, text: string) => {
      try {
        await sendTextMessage(
          { uid: myUid, name: myName },
          { uid: peerId, name: peerName },
          text,
          id,
        );
        // Keep the pending row; the realtime echo (same id) replaces it.
      } catch {
        if (mounted.current) {
          setPending(prev =>
            prev.map(p =>
              p.id === id ? { ...p, pending: false, failed: true } : p,
            ),
          );
        }
      }
    },
    [myUid, myName, peerId, peerName],
  );

  const send = useCallback(
    async (text: string) => {
      if (!myUid || !canSend(text)) {
        return;
      }
      const trimmed = text.trim();
      let id: string;
      try {
        id = newMessageId(chatId);
      } catch {
        return;
      }
      setPending(prev => [
        ...prev,
        {
          id,
          senderId: myUid,
          type: 'text',
          text: trimmed,
          createdAt: Date.now(),
          pending: true,
        },
      ]);
      await deliver(id, trimmed);
    },
    [chatId, myUid, deliver],
  );

  const retry = useCallback(
    async (id: string) => {
      const target = pendingRef.current.find(p => p.id === id && p.failed);
      if (!target || target.text === undefined) {
        return;
      }
      setPending(prev =>
        prev.map(p =>
          p.id === id ? { ...p, pending: true, failed: false } : p,
        ),
      );
      await deliver(id, target.text);
    },
    [deliver],
  );

  return { items, loadOlder, send, retry };
}
