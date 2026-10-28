import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

// Khung tam, se duoc thay o task sau.
export function SettingsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text variant="titleLarge">Cài đặt</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });
