import React, { useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Avatar, Divider, List, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { icons } from '../../../theme/icons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/metrics';

type Notice = {
  id: number;
  icon: string;
  title: string;
  body: string;
  time: string;
  unread: boolean;
};

const SAMPLE: Notice[] = [
  {
    id: 0,
    icon: icons.notifWelcome,
    title: 'Chào mừng bạn đến ChatApp',
    body: 'Bắt đầu trò chuyện với bạn bè ngay hôm nay.',
    time: '2 phút trước',
    unread: true,
  },
  {
    id: 1,
    icon: icons.location,
    title: 'Cập nhật vị trí',
    body: 'Bạn có thể gửi vị trí trong cuộc trò chuyện.',
    time: '1 giờ trước',
    unread: true,
  },
  {
    id: 2,
    icon: icons.notifTip,
    title: 'Mẹo sử dụng',
    body: 'Nhấn vào tin nhắn vị trí để mở Google Maps.',
    time: 'Hôm qua',
    unread: false,
  },
  {
    id: 3,
    icon: icons.notifSecurity,
    title: 'Bảo mật',
    body: 'Tin nhắn được lưu trên Firebase.',
    time: '2 ngày trước',
    unread: false,
  },
];

function NoticeIcon({ icon }: { icon: string }) {
  const theme = useTheme();
  return (
    <Avatar.Icon
      size={44}
      icon={icon}
      color={colors.onPrimaryContainer}
      style={{ backgroundColor: theme.colors.primaryContainer }}
    />
  );
}

function NoticeMeta({ item }: { item: Notice }) {
  const theme = useTheme();
  return (
    <View style={styles.right}>
      <Text
        variant="bodySmall"
        style={{ color: theme.colors.onSurfaceVariant }}
      >
        {item.time}
      </Text>
      {item.unread ? (
        <View
          testID={`unread-dot-${item.id}`}
          style={[styles.dot, { backgroundColor: theme.colors.primary }]}
        />
      ) : null}
    </View>
  );
}

const noticeIcon = (item: Notice) => () => <NoticeIcon icon={item.icon} />;
const noticeMeta = (item: Notice) => () => <NoticeMeta item={item} />;

export function NotificationsScreen() {
  const theme = useTheme();
  const [items, setItems] = useState(SAMPLE);

  const markRead = (id: number) =>
    setItems(list =>
      list.map(n => (n.id === id ? { ...n, unread: false } : n)),
    );

  const renderItem = ({ item }: { item: Notice }) => (
    <List.Item
      testID={`notification-${item.id}`}
      accessibilityLabel={`${item.title}${item.unread ? ', chưa đọc' : ''}`}
      title={item.title}
      titleNumberOfLines={2}
      description={item.body}
      descriptionNumberOfLines={3}
      left={noticeIcon(item)}
      right={noticeMeta(item)}
      onPress={() => markRead(item.id)}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <Text variant="titleLarge" style={styles.title}>
        Thông báo
      </Text>
      <FlatList
        data={items}
        keyExtractor={n => String(n.id)}
        renderItem={renderItem}
        ItemSeparatorComponent={Divider}
        ListEmptyComponent={
          <Text
            variant="bodyMedium"
            style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}
          >
            Không có thông báo
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { padding: spacing.lg },
  right: { alignItems: 'flex-end', justifyContent: 'center', gap: spacing.sm },
  dot: { width: 10, height: 10, borderRadius: 5 },
  empty: { textAlign: 'center', padding: spacing.xl },
});
