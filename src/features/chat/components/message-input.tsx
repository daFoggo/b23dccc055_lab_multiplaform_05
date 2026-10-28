import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton, TextInput } from 'react-native-paper';
import { icons } from '../../../theme/icons';
import { canSend } from '../../../lib/messages';
import { MAX_MESSAGE_LENGTH } from '../../../services/chat-service';
import { colors } from '../../../theme/colors';
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
    <View style={styles.container}>
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
        mode="flat"
        multiline
        placeholder="Nhắn tin"
        value={text}
        onChangeText={setText}
        maxLength={MAX_MESSAGE_LENGTH}
        underlineColor="transparent"
        activeUnderlineColor="transparent"
        underlineStyle={styles.noUnderline}
        style={styles.input}
        dense
      />
      <IconButton
        testID="send-button"
        icon={icons.send}
        size={24}
        mode="contained"
        containerColor={colors.primary}
        iconColor={colors.onPrimary}
        disabled={!enabled}
        style={styles.button}
        accessibilityLabel="Gửi"
        onPress={submit}
      />
    </View>
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
    backgroundColor: colors.surfaceContainerHigh,
    borderTopLeftRadius: radius.extraLarge,
    borderTopRightRadius: radius.extraLarge,
    borderBottomLeftRadius: radius.extraLarge,
    borderBottomRightRadius: radius.extraLarge,
    overflow: 'hidden',
  },
  noUnderline: { display: 'none' },
  button: { width: touchTarget, height: touchTarget, margin: 0 },
});
