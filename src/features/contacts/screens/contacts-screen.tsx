import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import { Avatar, List, Searchbar, Text, useTheme } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/auth-context';
import { useUsers } from '../hooks/use-users';
import { avatarColor, initials } from '../../../lib/avatar';
import { filterUsers, sortContacts } from '../../../lib/filter-users';
import { formatLastSeen } from '../../../lib/format-time';
import { colors } from '../../../theme/colors';
import { flatStyles } from '../../../theme/component-styles';
import { spacing, touchTarget } from '../../../theme/metrics';
import type { RootStackParamList } from '../../../navigation/types';
import type { UserProfile } from '../../../services/types';

type Nav = NavigationProp<RootStackParamList>;

const AVATAR_SIZE = 48;

function ContactAvatar({ user }: { user: UserProfile }) {
  const theme = useTheme();
  return (
    <View style={styles.avatarWrap}>
      <Avatar.Text
        size={AVATAR_SIZE}
        label={initials(user.name)}
        style={{ backgroundColor: avatarColor(user.uid) }}
        color={colors.onPrimary}
      />
      {user.online ? (
        <View
          testID={`online-dot-${user.uid}`}
          style={[
            styles.dot,
            {
              backgroundColor: colors.online,
              borderColor: theme.colors.background,
            },
          ]}
        />
      ) : null}
    </View>
  );
}

const avatarFor = (user: UserProfile) => () => <ContactAvatar user={user} />;

export function ContactsScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const { users, loading, error } = useUsers(user?.uid ?? '');
  const [query, setQuery] = useState('');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(id);
  }, []);

  const data = useMemo(
    () => sortContacts(filterUsers(users, query)),
    [users, query],
  );

  const renderItem = ({ item }: { item: UserProfile }) => (
    <List.Item
      testID={`contact-${item.uid}`}
      title={item.name}
      description={item.online ? 'online' : formatLastSeen(item.lastSeen, now)}
      descriptionStyle={
        item.online
          ? { color: colors.online }
          : { color: theme.colors.onSurfaceVariant }
      }
      style={styles.row}
      left={avatarFor(item)}
      onPress={() =>
        navigation.navigate('Chat', { peerId: item.uid, peerName: item.name })
      }
    />
  );

  const emptyText = error
    ? error
    : query.trim()
    ? 'Không tìm thấy kết quả'
    : 'Chưa có ai khác đăng ký';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text variant="titleLarge" style={styles.title}>
        Danh bạ
      </Text>
      <Searchbar
        testID="contacts-search"
        placeholder="Tìm kiếm"
        value={query}
        onChangeText={setQuery}
        style={styles.search}
        inputStyle={styles.searchInput}
      />
      <FlatList
        data={data}
        keyExtractor={item => item.uid}
        renderItem={renderItem}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text
            testID="contacts-empty"
            variant="bodyMedium"
            style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}
          >
            {loading ? '' : emptyText}
          </Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  search: {
    ...flatStyles.pill,
    backgroundColor: colors.surfaceContainerHigh,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    elevation: 0,
  },
  searchInput: { minHeight: 0 },
  row: { minHeight: touchTarget + spacing.lg, paddingHorizontal: spacing.lg },
  avatarWrap: { justifyContent: 'center', marginRight: spacing.sm },
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 4,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2,
  },
  empty: { textAlign: 'center', marginTop: spacing.xxl },
});
