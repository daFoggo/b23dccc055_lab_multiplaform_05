import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Khung tam, se duoc thay o task sau.
export function NotificationsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text variant="titleLarge">Thông báo</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });
