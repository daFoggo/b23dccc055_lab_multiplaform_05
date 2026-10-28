import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import {
  ActivityIndicator,
  Avatar,
  Badge,
  Button,
  List,
  Text,
  useTheme,
} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useConversationsContext } from '../conversations-context';
import { avatarColor, initials } from '../../../lib/avatar';
import { formatConversationTime } from '../../../lib/format-time';
import { colors } from '../../../theme/colors';
import { fontFamily } from '../../../theme/fonts';
import { icons } from '../../../theme/icons';
import { spacing, touchTarget } from '../../../theme/metrics';
import type {
  RootStackParamList,
  TabParamList,
} from '../../../navigation/types';
import type { ConversationSummary } from '../../../services/types';

type Nav = NavigationProp<RootStackParamList & TabParamList>;

// Icon/avatar sizes used by this screen (single place to tweak).
const AVATAR_SIZE = 48;
const PREVIEW_ICON_SIZE = 16;
const BADGE_SIZE = 20;
const LOCATION_LABEL = 'Vị trí';

function conversationLabel(item: ConversationSummary): string {
  const preview =
    item.lastType === 'location' ? LOCATION_LABEL : item.lastMessage;
  return item.unread > 0
    ? `${item.peerName}, ${item.unread} tin chưa đọc, ${preview}`
    : `${item.peerName}, ${preview}`;
}

function ConversationAvatar({ item }: { item: ConversationSummary }) {
  return (
    <View style={styles.avatarWrap}>
      <Avatar.Text
        size={AVATAR_SIZE}
        label={initials(item.peerName)}
        style={{ backgroundColor: avatarColor(item.peerId) }}
        color={colors.onPrimary}
      />
    </View>
  );
}

const avatarFor = (item: ConversationSummary) => () =>
  <ConversationAvatar item={item} />;

function ConversationPreview({ item }: { item: ConversationSummary }) {
  const theme = useTheme();
  const unread = item.unread > 0;
  return item.lastType === 'location' ? (
    <View style={styles.previewRow}>
      <MaterialCommunityIcons
        name={icons.location}
        size={PREVIEW_ICON_SIZE}
        color={theme.colors.onSurfaceVariant}
      />
      <Text
        variant="bodyMedium"
        numberOfLines={1}
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {' '}
        {LOCATION_LABEL}
      </Text>
    </View>
  ) : (
    <Text
      variant="bodyMedium"
      numberOfLines={1}
      style={{
        color: unread ? theme.colors.onSurface : theme.colors.onSurfaceVariant,
      }}
    >
      {item.lastMessage}
    </Text>
  );
}

const previewFor = (item: ConversationSummary) => () =>
  <ConversationPreview item={item} />;

function ConversationMeta({
  item,
  now,
}: {
  item: ConversationSummary;
  now: number;
}) {
  const theme = useTheme();
  const unread = item.unread > 0;
  return (
    <View style={styles.right}>
      <Text
        variant="labelSmall"
        style={{
          color: unread ? theme.colors.primary : theme.colors.onSurfaceVariant,
        }}
      >
        {formatConversationTime(item.lastAt, now)}
      </Text>
      {unread ? (
        <Badge
          testID={`unread-${item.peerId}`}
          size={BADGE_SIZE}
          style={[
            styles.badge,
            {
              backgroundColor: theme.colors.primary,
              color: theme.colors.onPrimary,
            },
          ]}
        >
          {item.unread > 99 ? '99+' : item.unread}
        </Badge>
      ) : null}
    </View>
  );
}

const metaFor = (item: ConversationSummary, now: number) => () =>
  <ConversationMeta item={item} now={now} />;

export function HomeScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { conversations, loading, error } = useConversationsContext();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const renderItem = ({ item }: { item: ConversationSummary }) => {
    const unread = item.unread > 0;
    return (
      <List.Item
        testID={`conversation-${item.peerId}`}
        accessibilityLabel={conversationLabel(item)}
        title={item.peerName}
        titleNumberOfLines={1}
        titleStyle={{
          fontFamily: unread ? fontFamily.bold : fontFamily.semibold,
        }}
        description={previewFor(item)}
        style={styles.row}
        left={avatarFor(item)}
        right={metaFor(item, now)}
        onPress={() =>
          navigation.navigate('Chat', {
            peerId: item.peerId,
            peerName: item.peerName,
          })
        }
      />
    );
  };

  const empty = loading ? (
    <ActivityIndicator testID="home-loading" animating style={styles.empty} />
  ) : error ? (
    <Text
      variant="bodyMedium"
      style={[styles.emptyText, { color: theme.colors.error }]}
    >
      {error}
    </Text>
  ) : (
    <View style={styles.empty}>
      <Text variant="titleMedium" style={styles.emptyText}>
        Chưa có cuộc trò chuyện nào
      </Text>
      <Text
        variant="bodyMedium"
        style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}
      >
        Vào Danh bạ để bắt đầu trò chuyện với ai đó.
      </Text>
      <Button
        testID="go-contacts"
        mode="contained-tonal"
        style={styles.emptyButton}
        onPress={() => navigation.navigate('Contacts')}
      >
        Mở Danh bạ
      </Button>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text variant="titleLarge" style={styles.title}>
        Trò chuyện
      </Text>
      <FlatList
        data={conversations}
        keyExtractor={item => item.peerId}
        renderItem={renderItem}
        ListEmptyComponent={empty}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  row: { minHeight: touchTarget + spacing.lg, paddingHorizontal: spacing.lg },
  avatarWrap: { justifyContent: 'center', marginRight: spacing.sm },
  previewRow: { flexDirection: 'row', alignItems: 'center' },
  right: { alignItems: 'flex-end', justifyContent: 'center', gap: spacing.xs },
  badge: { alignSelf: 'flex-end' },
  empty: { alignItems: 'center', marginTop: spacing.xxl },
  emptyText: { textAlign: 'center' },
  emptyButton: { marginTop: spacing.lg },
});
