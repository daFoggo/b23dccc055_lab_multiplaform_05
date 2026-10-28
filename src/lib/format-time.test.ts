import {
  formatConversationTime,
  formatDayLabel,
  formatLastSeen,
  formatTime,
} from './format-time';

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

describe('formatConversationTime', () => {
  const now = at(28, 15); // Wed 28/10/2026

  test('clamps timestamps after now to now (server clock skew)', () => {
    const late = at(28, 23, 59);
    expect(formatConversationTime(at(29, 0, 5), late)).toBe('23:59');
    expect(formatConversationTime(at(28, 15, 3), now)).toBe('15:00');
  });
  test('same day shows HH:mm', () => {
    expect(formatConversationTime(at(28, 9, 5), now)).toBe('09:05');
  });
  test('yesterday', () => {
    expect(formatConversationTime(at(27, 23), now)).toBe('Hôm qua');
  });
  test('older within the week shows short weekday', () => {
    expect(formatConversationTime(at(26, 8), now)).toBe('T2');
    expect(formatConversationTime(at(25, 8), now)).toBe('CN');
    expect(formatConversationTime(at(22, 8), now)).toBe('T5');
  });
  test('a week or more shows dd/mm/yyyy', () => {
    expect(formatConversationTime(at(21, 8), now)).toBe('21/10/2026');
    expect(formatConversationTime(at(3, 8), now)).toBe('03/10/2026');
  });
  test('future timestamps are clamped to now', () => {
    expect(formatConversationTime(at(28, 23), now)).toBe('15:00');
    expect(formatConversationTime(at(30, 8), now)).toBe('15:00');
  });
});
