import {ref, serverTimestamp, update} from 'firebase/database';
import {db} from './firebase';

export async function setOffline(uid: string): Promise<void> {
  await update(ref(db, `users/${uid}`), {
    online: false,
    lastSeen: serverTimestamp(),
  });
}
