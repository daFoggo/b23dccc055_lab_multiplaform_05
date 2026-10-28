import { useEffect, useState } from 'react';
import { subscribeConversations } from '../../../services/chat-service';
import type { ConversationSummary } from '../../../services/types';

export type ConversationsState = {
  conversations: ConversationSummary[];
  totalUnread: number;
  loading: boolean;
  error?: string;
};

const EMPTY: ConversationsState = {
  conversations: [],
  totalUnread: 0,
  loading: false,
  error: undefined,
};

export function useConversations(uid: string): ConversationsState {
  const [state, setState] = useState<ConversationsState>(
    uid ? { ...EMPTY, loading: true } : EMPTY,
  );

  useEffect(() => {
    if (!uid) {
      setState(EMPTY);
      return undefined;
    }
    let active = true;
    setState({ ...EMPTY, loading: true });
    const unsubscribe = subscribeConversations(
      uid,
      list => {
        if (!active) {
          return;
        }
        const conversations = list.filter(
          c => c.peerId !== uid && c.lastAt > 0,
        );
        setState({
          conversations,
          totalUnread: conversations.reduce((s, c) => s + c.unread, 0),
          loading: false,
          error: undefined,
        });
      },
      () => {
        if (active) {
          setState({
            ...EMPTY,
            error: 'Không tải được danh sách trò chuyện',
          });
        }
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [uid]);

  return state;
}
