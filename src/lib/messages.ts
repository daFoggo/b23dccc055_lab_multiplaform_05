import type { ChatMessage } from '../services/types';
import { formatDayLabel } from './format-time';

export type ListItem =
  | { type: 'day'; label: string; key: string }
  | { type: 'message'; message: ChatMessage };

export function canSend(text: string): boolean {
  return text.trim().length > 0;
}

function dayKey(ms: number): string {
  const d = new Date(ms);
  return `day-${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

// Messages are expected in ascending order; a day separator precedes the
// first message of each calendar day.
export function groupByDay(messages: ChatMessage[], now: number): ListItem[] {
  const items: ListItem[] = [];
  let lastKey = '';
  for (const message of messages) {
    const key = dayKey(message.createdAt);
    if (key !== lastKey) {
      items.push({
        type: 'day',
        label: formatDayLabel(message.createdAt, now),
        key,
      });
      lastKey = key;
    }
    items.push({ type: 'message', message });
  }
  return items;
}
