import React, { useState } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { IconButton, Surface, TextInput, useTheme } from 'react-native-paper';
import { icons } from '../../../theme/icons';
import { canSend } from '../../../lib/messages';
import { MAX_MESSAGE_LENGTH } from '../../../services/chat-service';
import {
  radius,
  spacing,
  typography,
} from '../../../theme/metrics';

type Props = {
  onSend: (text: string) => void;
  onPressLocation?: () => void;
  locating?: boolean;
  bottomInset?: number;
};

export function MessageInput({
  onSend,
  onPressLocation,
  locating = false,
  bottomInset = 0,
}: Props) {
  const theme = useTheme();
  const [text, setText] = useState('');
  const enabled = canSend(text);

  const submit = () => {
    if (!enabled) {
      return;
    }
    onSend(text);
    setText('');
  };

  return (
    <Surface
      elevation={2}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          paddingBottom: Math.max(bottomInset, spacing.sm),
        },
      ]}
    >
      {onPressLocation ? (
        <IconButton
          testID="location-button"
          icon={icons.location}
          size={22}
          mode="contained-tonal"
          containerColor={theme.colors.surfaceVariant}
          iconColor={theme.colors.primary}
          style={styles.actionButton}
          accessibilityLabel="Gửi vị trí"
          disabled={locating}
          loading={locating}
          onPress={onPressLocation}
        />
      ) : null}
      <TextInput
        testID="message-input"
        accessibilityLabel="Nhập tin nhắn"
        mode="outlined"
        multiline
        placeholder="Nhắn tin"
        placeholderTextColor={theme.colors.onSurfaceVariant}
        value={text}
        onChangeText={setText}
        maxLength={MAX_MESSAGE_LENGTH}
        outlineStyle={styles.inputOutline}
        contentStyle={styles.inputContent}
        style={[
          styles.input,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
        dense
      />
      <IconButton
        testID="send-button"
        icon={icons.send}
        size={22}
        mode="contained"
        containerColor={theme.colors.primary}
        iconColor={theme.colors.onPrimary}
        disabled={!enabled}
        style={styles.actionButton}
        accessibilityLabel="Gửi"
        onPress={submit}
      />
    </Surface>
  );
}

// 4 lines of bodyLarge plus vertical padding.
const MAX_INPUT_HEIGHT = typography.bodyLarge.lineHeight * 4 + spacing.lg;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.sm,
    paddingTop: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    maxHeight: MAX_INPUT_HEIGHT,
    minHeight: 44,
  },
  inputOutline: {
    borderRadius: radius.extraLarge,
    borderColor: 'transparent',
  },
  inputContent: {
    paddingHorizontal: spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 8 : 6,
    paddingBottom: Platform.OS === 'ios' ? 8 : 6,
  },
  actionButton: {
    width: 44,
    height: 44,
    margin: 0,
  },
});
