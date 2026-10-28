import React, { useEffect, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Avatar,
  Button,
  Dialog,
  List,
  Portal,
  Snackbar,
  Surface,
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
import { flatStyles } from '../../../theme/component-styles';
import { spacing } from '../../../theme/metrics';

const renderInfoIcon = (props: { color: string; style?: object }) => (
  <List.Icon {...props} icon={icons.info} />
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
      <Surface style={[flatStyles.card, styles.account]}>
        <Avatar.Text
          size={56}
          label={initials(user?.name ?? '')}
          style={{ backgroundColor: avatarColor(user?.uid ?? '') }}
          color={colors.onPrimary}
        />
        <View style={styles.accountText}>
          <Text variant="titleMedium">{user?.name}</Text>
          <Text
            variant="bodyMedium"
            style={{ color: theme.colors.onSurfaceVariant }}
          >
            {user?.email}
          </Text>
        </View>
      </Surface>
      <Surface style={flatStyles.card}>
        <List.Item
          title="Phiên bản"
          description={APP_VERSION}
          left={renderInfoIcon}
        />
      </Surface>
      <Button
        testID="logout-button"
        accessibilityLabel="Đăng xuất"
        mode="outlined"
        icon={icons.logout}
        textColor={theme.colors.error}
        style={[flatStyles.buttonShape, { borderColor: theme.colors.error }]}
        contentStyle={flatStyles.buttonContent}
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
          <Dialog.Title>Đăng xuất khỏi tài khoản?</Dialog.Title>
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
          duration={4000}
        >
          Đăng xuất thất bại. Thử lại.
        </Snackbar>
      </Portal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg, gap: spacing.lg },
  title: { marginBottom: spacing.sm },
  account: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.lg,
  },
  accountText: { flex: 1 },
});
