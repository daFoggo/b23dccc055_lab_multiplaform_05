import React from 'react';
import { StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

// Khung tam, se duoc thay o task sau.
export function ChatScreen({ route }: Props) {
  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <Text variant="titleLarge">{route.params.peerName}</Text>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 16 } });
