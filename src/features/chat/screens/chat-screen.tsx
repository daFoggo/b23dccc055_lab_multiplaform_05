import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  StyleSheet,
  View,
} from 'react-native';
import { ActivityIndicator, Avatar, Text, useTheme } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useHeaderHeight } from '@react-navigation/elements';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAuth } from '../../auth/auth-context';
import { MessageBubble } from '../components/message-bubble';
import { MessageInput } from '../components/message-input';
import { useMessages } from '../hooks/use-messages';
import { usePeer } from '../hooks/use-peer';
import { avatarColor, initials } from '../../../lib/avatar';
import { getChatId } from '../../../lib/chat-id';
import { formatLastSeen } from '../../../lib/format-time';
import type { ListItem } from '../../../lib/messages';
import { colors } from '../../../theme/colors';
import { radius, spacing } from '../../../theme/metrics';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

const AVATAR_SIZE = 40;

type HeaderProps = {
  peerId: string;
  peerName: string;
  subtitle: string;
  subtitleColor: string;
};

function ChatHeaderTitle({
  peerId,
  peerName,
  subtitle,
  subtitleColor,
}: HeaderProps) {
  return (
    <View style={styles.headerTitle}>
      <Avatar.Text
        size={AVATAR_SIZE}
        label={initials(peerName)}
        style={{ backgroundColor: avatarColor(peerId) }}
        color={colors.onPrimary}
      />
      <View style={styles.headerText}>
        <Text variant="titleMedium" numberOfLines={1}>
          {peerName}
        </Text>
        <Text
          testID="chat-subtitle"
          variant="bodySmall"
          style={{ color: subtitleColor }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
  );
}

export function ChatScreen({ route, navigation }: Props) {
  const { peerId, peerName } = route.params;
  const theme = useTheme();
  const { user } = useAuth();
  const myUid = user?.uid ?? '';
  const chatId = getChatId(myUid, peerId);
  const { items, loadOlder, send, retry } = useMessages(
    chatId,
    myUid,
    peerId,
    user?.name ?? '',
    peerName,
  );
  const peer = usePeer(peerId);
  const headerHeight = useHeaderHeight();
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList<ListItem>>(null);
  const [keyboardVisible, setKeyboardVisible] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () =>
      setKeyboardVisible(true),
    );
    const hide = Keyboard.addListener('keyboardDidHide', () =>
      setKeyboardVisible(false),
    );
    return () => {
      show.remove();
      hide.remove();
    };
  }, []);

  const handleSend = useCallback(
    (text: string) => {
      send(text);
      listRef.current?.scrollToOffset({ offset: 0, animated: true });
    },
    [send],
  );
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const online = peer?.online === true;
  const subtitle = online ? 'online' : formatLastSeen(peer?.lastSeen, now);
  const subtitleColor = online ? colors.online : theme.colors.onSurfaceVariant;

  useEffect(() => {
    navigation.setOptions({
      // React Navigation requires a render function for headerTitle.
      // eslint-disable-next-line react/no-unstable-nested-components
      headerTitle: () => (
        <ChatHeaderTitle
          peerId={peerId}
          peerName={peerName}
          subtitle={subtitle}
          subtitleColor={subtitleColor}
        />
      ),
    });
  }, [navigation, peerId, peerName, subtitle, subtitleColor]);

  // Inverted list: newest at the bottom, data reversed (newest first).
  const data = useMemo(() => [...items].reverse(), [items]);

  const renderItem = useCallback(
    ({ item }: { item: ListItem }) =>
      item.type === 'day' ? (
        <View style={styles.dayWrap}>
          <Text
            variant="labelMedium"
            style={[
              styles.day,
              {
                backgroundColor: colors.surfaceContainerHigh,
                color: theme.colors.onSurfaceVariant,
              },
            ]}
          >
            {item.label}
          </Text>
        </View>
      ) : (
        <MessageBubble
          message={item.message}
          mine={item.message.senderId === myUid}
          onRetry={retry}
          senderName={peerName}
        />
      ),
    [myUid, retry, peerName, theme.colors.onSurfaceVariant],
  );

  const bottomPad = { paddingBottom: keyboardVisible ? 0 : insets.bottom };

  if (!user) {
    return (
      <View style={styles.center}>
        <ActivityIndicator animating />
      </View>
    );
  }

  return (
    // Bottom inset only while the keyboard is hidden (it already covers it).
    <View style={[styles.container, bottomPad]}>
      {/* Edge-to-edge Android ignores adjustResize, so pad on both platforms. */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={headerHeight}
      >
        <FlatList
          ref={listRef}
          testID="message-list"
          style={styles.container}
          inverted
          data={data}
          keyExtractor={item =>
            item.type === 'day' ? item.key : item.message.id
          }
          renderItem={renderItem}
          onEndReached={() => {
            loadOlder();
          }}
          onEndReachedThreshold={0.5}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.listContent}
        />
        <MessageInput onSend={handleSend} />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flexDirection: 'row', alignItems: 'center' },
  headerText: { marginLeft: spacing.md, flexShrink: 1 },
  listContent: { paddingVertical: spacing.sm },
  dayWrap: { alignItems: 'center', marginVertical: spacing.sm },
  day: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
});
