import { AppState } from 'react-native';
import {
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  update,
} from 'firebase/database';
import { db } from './firebase';
import type { Unsubscribe } from './types';

export async function setOffline(uid: string): Promise<void> {
  await update(ref(db, `users/${uid}`), {
    online: false,
    lastSeen: serverTimestamp(),
  });
}

// Listens to the connection state: when connected, registers the server-side
// onDisconnect handler FIRST and only then marks the user online. Also mirrors
// app background/foreground. The returned function only detaches listeners;
// logout is responsible for calling setOffline.
export function startPresence(uid: string): Unsubscribe {
  const userRef = ref(db, `users/${uid}`);
  let connected = false;

  const detachConnected = onValue(ref(db, '.info/connected'), snapshot => {
    connected = snapshot.val() === true;
    if (!connected) {
      return;
    }
    onDisconnect(userRef)
      .update({ online: false, lastSeen: serverTimestamp() })
      .then(() => update(userRef, { online: true }))
      .catch(() => {});
  });

  const appState = AppState.addEventListener('change', state => {
    if (!connected) {
      return;
    }
    const next =
      state === 'active'
        ? update(userRef, { online: true })
        : update(userRef, { online: false, lastSeen: serverTimestamp() });
    Promise.resolve(next).catch(() => {});
  });

  return () => {
    detachConnected();
    appState.remove();
  };
}
