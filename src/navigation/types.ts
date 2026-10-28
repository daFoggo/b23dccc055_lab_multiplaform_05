export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  Tabs: undefined;
  Chat: { peerId: string; peerName: string };
};

export type TabParamList = {
  Home: undefined;
  Contacts: undefined;
  Notifications: undefined;
  Settings: undefined;
};
