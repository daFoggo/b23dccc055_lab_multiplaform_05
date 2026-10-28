import React, { createContext, useContext } from 'react';
import { useAuth } from '../auth/auth-context';
import { useConversations } from './hooks/use-conversations';
import type { ConversationsState } from './hooks/use-conversations';

const ConversationsContext = createContext<ConversationsState>({
  conversations: [],
  totalUnread: 0,
  loading: false,
  error: undefined,
});

// Dat trong phan da dang nhap: dung dung mot listener cho Home va badge tab.
export function ConversationsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const value = useConversations(user?.uid ?? '');
  return (
    <ConversationsContext.Provider value={value}>
      {children}
    </ConversationsContext.Provider>
  );
}

export function useConversationsContext(): ConversationsState {
  return useContext(ConversationsContext);
}
