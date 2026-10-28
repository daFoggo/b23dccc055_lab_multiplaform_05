import type { UserProfile } from '../services/types';

function normalize(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase();
}

export function filterUsers(users: UserProfile[], q: string): UserProfile[] {
  const needle = normalize(q.trim());
  if (!needle) {
    return users;
  }
  return users.filter(u => normalize(u.name).includes(needle));
}

// Telegram-style: online first, then by name (Vietnamese collation).
export function sortContacts(users: UserProfile[]): UserProfile[] {
  return [...users].sort((a, b) => {
    if (a.online !== b.online) {
      return a.online ? -1 : 1;
    }
    return a.name.localeCompare(b.name, 'vi');
  });
}
