import {ref, set} from 'firebase/database';
import {db} from './firebase';

// Signed in and active at registration (avoids a presence write on a missing
// node). Must exist before any userChats write (rules check peerName against it).
export async function createUserProfile(
  uid: string,
  name: string,
): Promise<void> {
  await set(ref(db, `users/${uid}`), {name, online: true});
}
