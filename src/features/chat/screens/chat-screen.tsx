import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  View,
} from 'react-native';
import { Avatar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
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
        />
      ),
    [myUid, retry, theme.colors.onSurfaceVariant],
  );

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* Edge-to-edge Android ignores adjustResize, so pad on both platforms. */}
      <KeyboardAvoidingView
        style={styles.container}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 56 : 0}
      >
        <FlatList
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
        <MessageInput onSend={send} />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
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
