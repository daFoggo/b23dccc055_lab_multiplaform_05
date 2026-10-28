export type MessageType = 'text' | 'location';

export type UserProfile = {
  uid: string;
  name: string;
  online: boolean;
  lastSeen?: number;
};

export type ChatMessage = {
  id: string;
  senderId: string;
  type: MessageType;
  text?: string;
  lat?: number;
  lng?: number;
  createdAt: number;
  pending?: boolean;
  failed?: boolean;
};

export type ConversationSummary = {
  peerId: string;
  peerName: string;
  lastMessage: string;
  lastType: MessageType;
  lastAt: number;
  unread: number;
};

export type Unsubscribe = () => void;
