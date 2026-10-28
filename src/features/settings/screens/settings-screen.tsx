import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Avatar,
  Button,
  Card,
  Dialog,
  List,
  Portal,
  Snackbar,
  Text,
  useTheme,
} from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../auth/auth-context';
import { logoutUser } from '../../../services/auth-service';
import { avatarColor, initials } from '../../../lib/avatar';
import { APP_VERSION } from '../../../config/app-info';
import { icons } from '../../../theme/icons';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/metrics';

const renderInfoIcon = (props: { color: string; style?: object }) => (
  <List.Icon {...props} icon={icons.info} />
);

const avatarFor = (name: string, uid: string) => (props: { size: number }) => (
  <Avatar.Text
    {...props}
    size={56}
    label={initials(name)}
    style={{ backgroundColor: avatarColor(uid) }}
    color={colors.onPrimary}
  />
);

export function SettingsScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const busy = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const confirm = async () => {
    if (busy.current) {
      return;
    }
    busy.current = true;
    setLoading(true);
    try {
      await logoutUser();
      // Thanh cong: auth state doi -> RootNavigator go man hinh nay; khong set state.
    } catch {
      busy.current = false;
      if (mounted.current) {
        setLoading(false);
        setFailed(true);
      }
    }
  };

  const dismiss = () => {
    if (!busy.current) {
      setConfirmOpen(false);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      edges={['top']}
    >
      <Text variant="titleLarge" style={styles.title}>
        Cài đặt
      </Text>

      <Card mode="elevated" style={styles.card}>
        <Card.Title
          title={user?.name ?? ''}
          subtitle={user?.email ?? ''}
          titleVariant="titleMedium"
          subtitleVariant="bodyMedium"
          left={avatarFor(user?.name ?? '', user?.uid ?? '')}
          style={styles.cardTitle}
        />
      </Card>

      <Card mode="contained" style={styles.card}>
        <List.Item
          title="Phiên bản"
          description={APP_VERSION}
          left={renderInfoIcon}
        />
      </Card>

      <Button
        testID="logout-button"
        accessibilityLabel="Đăng xuất"
        mode="outlined"
        icon={icons.logout}
        textColor={theme.colors.error}
        style={[styles.logoutBtn, { borderColor: theme.colors.error }]}
        onPress={() => setConfirmOpen(true)}
      >
        Đăng xuất
      </Button>

      <Portal>
        <Dialog
          visible={confirmOpen}
          dismissable={!loading}
          onDismiss={dismiss}
        >
          <Dialog.Icon icon={icons.logout} color={theme.colors.error} />
          <Dialog.Title style={styles.dialogTitle}>
            Đăng xuất khỏi tài khoản?
          </Dialog.Title>
          <Dialog.Content>
            <Text variant="bodyMedium">
              Bạn có chắc chắn muốn đăng xuất khỏi ChatApp?
            </Text>
          </Dialog.Content>
          <Dialog.Actions>
            <Button
              testID="logout-cancel"
              disabled={loading}
              onPress={() => setConfirmOpen(false)}
            >
              Hủy
            </Button>
            <Button
              testID="logout-confirm"
              disabled={loading}
              textColor={theme.colors.error}
              loading={loading}
              onPress={confirm}
            >
              Đăng xuất
            </Button>
          </Dialog.Actions>
        </Dialog>
        <Snackbar
          visible={failed}
          onDismiss={() => setFailed(false)}
          duration={3000}
        >
          Đăng xuất thất bại. Thử lại.
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  title: {
    paddingVertical: spacing.md,
  },
  card: {
    marginBottom: spacing.md,
  },
  cardTitle: {
    paddingVertical: spacing.xs,
  },
  logoutBtn: {
    marginTop: spacing.md,
  },
  dialogTitle: {
    textAlign: 'center',
  },
});
