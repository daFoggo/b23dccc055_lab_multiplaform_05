import { getChatId } from './chat-id';

it('is symmetric and sorted, joined by underscore', () => {
  expect(getChatId('b', 'a')).toBe('a_b');
  expect(getChatId('a', 'b')).toBe('a_b');
});
