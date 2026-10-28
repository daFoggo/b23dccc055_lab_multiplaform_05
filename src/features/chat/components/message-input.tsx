import React, { useState } from 'react';
import { StyleSheet } from 'react-native';
import { IconButton, Surface, TextInput, useTheme } from 'react-native-paper';
import { icons } from '../../../theme/icons';
import { canSend } from '../../../lib/messages';
import { MAX_MESSAGE_LENGTH } from '../../../services/chat-service';
import {
  radius,
  spacing,
  touchTarget,
  typography,
} from '../../../theme/metrics';

type Props = {
  onSend: (text: string) => void;
  onPressLocation?: () => void;
  locating?: boolean;
};

export function MessageInput({
  onSend,
  onPressLocation,
  locating = false,
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
      style={[styles.container, { backgroundColor: theme.colors.surface }]}
    >
      {onPressLocation ? (
        <IconButton
          testID="location-button"
          icon={icons.location}
          size={24}
          style={styles.button}
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
        value={text}
        onChangeText={setText}
        maxLength={MAX_MESSAGE_LENGTH}
        outlineStyle={styles.inputOutline}
        style={[
          styles.input,
          { backgroundColor: theme.colors.surfaceVariant },
        ]}
        dense
      />
      <IconButton
        testID="send-button"
        icon={icons.send}
        size={24}
        mode="contained"
        containerColor={theme.colors.primary}
        iconColor={theme.colors.onPrimary}
        disabled={!enabled}
        style={styles.button}
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
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  input: {
    flex: 1,
    maxHeight: MAX_INPUT_HEIGHT,
    minHeight: touchTarget,
  },
  inputOutline: {
    borderRadius: radius.extraLarge,
    borderColor: 'transparent',
  },
  button: { width: touchTarget, height: touchTarget, margin: 0 },
});
