import { formatDayLabel, formatLastSeen, formatTime } from './format-time';

const at = (d: number, h = 12, m = 0) => new Date(2026, 9, d, h, m).getTime();

test('formatTime returns HH:mm', () => {
  expect(formatTime(at(28, 9, 5))).toBe('09:05');
});

test('formatDayLabel covers today, yesterday and older dates', () => {
  const now = at(28, 15);
  expect(formatDayLabel(at(28, 1), now)).toBe('Hôm nay');
  expect(formatDayLabel(at(27, 23), now)).toBe('Hôm qua');
  expect(formatDayLabel(at(3, 8), now)).toBe('03/10/2026');
});

test('formatLastSeen', () => {
  const now = at(28, 12);
  expect(formatLastSeen(undefined, now)).toBe('Ngoại tuyến');
  expect(formatLastSeen(now - 20 * 1000, now)).toBe('Hoạt động vừa xong');
  expect(formatLastSeen(now - 5 * 60000, now)).toBe('Hoạt động 5 phút trước');
  expect(formatLastSeen(now - 3 * 3600000, now)).toBe('Hoạt động 3 giờ trước');
  expect(formatLastSeen(now - 2 * 86400000, now)).toBe(
    'Hoạt động 2 ngày trước',
  );
  expect(formatLastSeen(now - 30 * 86400000, now)).toBe('Hoạt động 28/09/2026');
});
