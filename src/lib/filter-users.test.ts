import type { UserProfile } from '../services/types';
import { filterUsers, sortContacts } from './filter-users';

const u = (uid: string, name: string, online = false): UserProfile => ({
  uid,
  name,
  online,
});

test('filterUsers ignores case and diacritics; empty query returns all', () => {
  const users = [u('1', 'Nguyễn An'), u('2', 'Đào Bình')];
  expect(filterUsers(users, 'nguyen')).toEqual([users[0]]);
  expect(filterUsers(users, 'DAO')).toEqual([users[1]]);
  expect(filterUsers(users, '')).toEqual(users);
  expect(filterUsers(users, '  ')).toEqual(users);
  expect(filterUsers(users, 'zzz')).toEqual([]);
});

test('sortContacts puts online first then sorts by name (vi)', () => {
  const sorted = sortContacts([
    u('1', 'Bình'),
    u('2', 'Chi', true),
    u('3', 'An'),
    u('4', 'Ân', true),
  ]);
  expect(sorted.map(x => x.uid)).toEqual(['4', '2', '3', '1']);
});
