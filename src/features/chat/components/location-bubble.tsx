import React, { useCallback } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Surface, Text, useTheme } from 'react-native-paper';
import { icons } from '../../../theme/icons';
import { formatTime } from '../../../lib/format-time';
import { buildMapsUrl } from '../../../lib/maps';
import { colors } from '../../../theme/colors';
import { radius, spacing } from '../../../theme/metrics';
import type { ChatMessage } from '../../../services/types';

type Props = {
  message: ChatMessage;
  mine: boolean;
  label: string;
  // Whole-bubble retry is handled by the parent when the message failed.
  disabled?: boolean;
  // Wrapped by a retry Pressable that already applies the max width.
  fill?: boolean;
};

export function LocationBubble({ message, mine, label, disabled, fill }: Props) {
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

  const lat = message.lat ?? NaN;
  const lng = message.lng ?? NaN;
  const coordsText =
    Number.isFinite(lat) && Number.isFinite(lng)
      ? `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      : '';

  const open = useCallback(() => {
    try {
      Linking.openURL(buildMapsUrl(lat, lng)).catch(() => {});
    } catch {
      // Invalid stored coordinates: nothing to open.
    }
  }, [lat, lng]);

  const a11y = `${label}, ${coordsText}, ${formatTime(message.createdAt)}`;

  return (
    <Surface
      testID={`bubble-${message.id}`}
      elevation={0}
      style={[
        styles.bubble,
        fill ? styles.fill : null,
        mine ? styles.bubbleMine : styles.bubbleOther,
        { backgroundColor: background },
        message.pending ? styles.pending : null,
      ]}
    >
      <Pressable
        testID={`location-open-${message.id}`}
        accessibilityRole="button"
        accessibilityLabel={`${a11y}. Mở trong Google Maps`}
        disabled={disabled}
        onPress={open}
        style={styles.press}
      >
        <View style={styles.card}>
          <Icon
            source={icons.mapMarker}
            size={28}
            color={theme.colors.primary}
          />
          <View style={styles.cardText}>
            <Text variant="titleSmall" style={{ color: foreground }}>
              {label}
            </Text>
            <Text variant="bodySmall" style={{ color: foreground }}>
              {coordsText}
            </Text>
          </View>
        </View>
        <Text variant="labelLarge" style={{ color: theme.colors.primary }}>
          Mở trong Google Maps
        </Text>
        <View style={styles.meta}>
          {failed ? (
            <Text variant="labelSmall" style={{ color: theme.colors.error }}>
              Gửi lại
            </Text>
          ) : null}
          {message.pending ? (
            <View accessible accessibilityLabel="Đang gửi">
              <Icon source={icons.pending} size={12} color={foreground} />
            </View>
          ) : (
            <Text variant="bodySmall" style={{ color: foreground }}>
              {formatTime(message.createdAt)}
            </Text>
          )}
        </View>
      </Pressable>
    </Surface>
  );
}

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '78%',
    minWidth: 220,
    padding: spacing.sm,
    borderRadius: radius.control,
  },
  bubbleMine: { borderBottomRightRadius: radius.extraSmall },
  bubbleOther: { borderBottomLeftRadius: radius.extraSmall },
  fill: { maxWidth: '100%' },
  pending: { opacity: 0.6 },
  press: { gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.medium,
    backgroundColor: colors.surfaceContainerHigh,
  },
  cardText: { flexShrink: 1 },
  meta: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
