const pad = (n: number) => String(n).padStart(2, '0');

export function formatTime(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function startOfDay(ms: number): number {
  const d = new Date(ms);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

export function formatDayLabel(ms: number, now: number): string {
  const today = startOfDay(now);
  const day = startOfDay(ms);
  if (day === today) {
    return 'Hôm nay';
  }
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (day === yesterday.getTime()) {
    return 'Hôm qua';
  }
  return formatDate(ms);
}

export function formatLastSeen(
  lastSeen: number | undefined,
  now: number,
): string {
  if (!lastSeen) {
    return 'Ngoại tuyến';
  }
  const minutes = Math.floor(Math.max(0, now - lastSeen) / 60000);
  if (minutes < 1) {
    return 'Hoạt động vừa xong';
  }
  if (minutes < 60) {
    return `Hoạt động ${minutes} phút trước`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `Hoạt động ${hours} giờ trước`;
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return `Hoạt động ${days} ngày trước`;
  }
  return `Hoạt động ${formatDate(lastSeen)}`;
}

const WEEKDAYS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

export function formatConversationTime(rawMs: number, now: number): string {
  // serverTimestamp can run ahead of the device clock: never show the future.
  const ms = Math.min(rawMs, now);
  const today = startOfDay(now);
  const day = startOfDay(ms);
  if (day === today) {
    return formatTime(ms);
  }
  const diffDays = Math.round((today - day) / 86400000);
  if (diffDays === 1) {
    return 'Hôm qua';
  }
  if (diffDays > 1 && diffDays < 7) {
    return WEEKDAYS[new Date(ms).getDay()];
  }
  return formatDate(ms);
}
