import React from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Surface, Text, useTheme } from 'react-native-paper';
import { formatTime } from '../../../lib/format-time';
import { colors } from '../../../theme/colors';
import { radius, spacing } from '../../../theme/metrics';
import type { ChatMessage } from '../../../services/types';

type Props = {
  message: ChatMessage;
  mine: boolean;
  onRetry?: (id: string) => void;
};

export function MessageBubble({ message, mine, onRetry }: Props) {
  const theme = useTheme();
  const failed = message.failed === true;
  const background = failed
    ? theme.colors.errorContainer
    : mine
    ? colors.bubbleMine
    : colors.bubbleOther;
  const foreground = failed
    ? theme.colors.onErrorContainer
    : mine
    ? colors.onBubbleMine
    : colors.onBubbleOther;

  const body = (
    <Surface
      testID={`bubble-${message.id}`}
      elevation={0}
      style={[
        styles.bubble,
        mine ? styles.bubbleMine : styles.bubbleOther,
        { backgroundColor: background },
        message.pending ? styles.pending : null,
      ]}
    >
      <Text variant="bodyLarge" style={{ color: foreground }}>
        {message.text}
      </Text>
      <View style={styles.meta}>
        {failed ? (
          <Text variant="labelSmall" style={{ color: theme.colors.error }}>
            Gửi lại
          </Text>
        ) : null}
        {message.pending ? (
          <Icon source="clock-outline" size={12} color={foreground} />
        ) : (
          <Text variant="bodySmall" style={{ color: foreground }}>
            {formatTime(message.createdAt)}
          </Text>
        )}
      </View>
    </Surface>
  );

  return (
    <View
      testID={`row-${message.id}`}
      style={[styles.row, mine ? styles.rowMine : styles.rowOther]}
    >
      {failed && onRetry ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Gửi lại"
          onPress={() => onRetry(message.id)}
          style={styles.retry}
        >
          {body}
        </Pressable>
      ) : (
        body
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    marginVertical: 2,
  },
  rowMine: { justifyContent: 'flex-end' },
  rowOther: { justifyContent: 'flex-start' },
  retry: { maxWidth: '78%' },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.control,
  },
  // Telegram-style tail: smaller radius on the sender's bottom corner.
  bubbleMine: { borderBottomRightRadius: radius.extraSmall },
  bubbleOther: { borderBottomLeftRadius: radius.extraSmall },
  pending: { opacity: 0.6 },
  meta: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
