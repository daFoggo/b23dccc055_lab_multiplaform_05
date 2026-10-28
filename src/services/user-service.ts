import { onValue, ref, set } from 'firebase/database';
import { db } from './firebase';
import type { Unsubscribe, UserProfile } from './types';

// Signed in and active at registration (avoids a presence write on a missing
// node). Must exist before any userChats write (rules check peerName against it).
export async function createUserProfile(
  uid: string,
  name: string,
): Promise<void> {
  await set(ref(db, `users/${uid}`), { name, online: true });
}

type RawUser = { name?: string; online?: boolean; lastSeen?: number };

function toProfile(uid: string, raw: RawUser): UserProfile {
  return {
    uid,
    name: raw.name ?? '',
    online: raw.online === true,
    lastSeen: raw.lastSeen,
  };
}

function guardError(isActive: () => boolean, onError?: (e: Error) => void) {
  return (e: Error) => {
    if (isActive()) {
      onError?.(e);
    }
  };
}

export function subscribeUsers(
  myUid: string,
  cb: (users: UserProfile[]) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  let active = true;
  const detach = onValue(
    ref(db, 'users'),
    snapshot => {
      if (!active) {
        return;
      }
      const val = (snapshot.val() ?? {}) as Record<string, RawUser>;
      const users = Object.entries(val)
        .filter(([uid]) => uid !== myUid)
        .map(([uid, raw]) => toProfile(uid, raw))
        .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
      cb(users);
    },
    guardError(() => active, onError),
  );
  return () => {
    active = false;
    detach();
  };
}

export function subscribeUser(
  uid: string,
  cb: (u: UserProfile | null) => void,
  onError?: (e: Error) => void,
): Unsubscribe {
  let active = true;
  const detach = onValue(
    ref(db, `users/${uid}`),
    snapshot => {
      if (!active) {
        return;
      }
      cb(snapshot.exists() ? toProfile(uid, snapshot.val() as RawUser) : null);
    },
    guardError(() => active, onError),
  );
  return () => {
    active = false;
    detach();
  };
}
