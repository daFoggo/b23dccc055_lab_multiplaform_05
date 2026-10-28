import { avatarColor, initials } from './avatar';
import { avatarPalette } from '../theme/colors';

test('initials uses first letters of first and last word, uppercased', () => {
  expect(initials('nguyễn văn an')).toBe('NA');
  expect(initials('An')).toBe('A');
  expect(initials('  ')).toBe('?');
});

test('avatarColor is stable and within the palette', () => {
  expect(avatarColor('uid-1')).toBe(avatarColor('uid-1'));
  for (const id of ['a', 'b', 'uid-xyz', '']) {
    expect(avatarPalette).toContain(avatarColor(id));
  }
});
