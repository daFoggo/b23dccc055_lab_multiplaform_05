import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {auth} from './firebase';
import {setOffline} from './presence-service';
import type {Unsubscribe} from './types';
import {createUserProfile} from './user-service';

export type AuthUser = {uid: string; name: string; email: string};

const normalizeEmail = (email: string) => email.trim().toLowerCase();

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<void> {
  const displayName = name.trim();
  if (displayName.length < 1 || displayName.length > 50) {
    throw new Error('Tên phải từ 1 đến 50 ký tự.');
  }
  const cred = await createUserWithEmailAndPassword(
    auth,
    normalizeEmail(email),
    password,
  );
  try {
    await updateProfile(cred.user, {displayName});
    await createUserProfile(cred.user.uid, displayName);
  } catch (e) {
    // Avoid an orphan account / profile-less signed-in user.
    try {
      await deleteUser(cred.user);
    } catch {
      // ignore
    }
    throw e;
  }
}

export async function loginUser(
  email: string,
  password: string,
): Promise<void> {
  await signInWithEmailAndPassword(auth, normalizeEmail(email), password);
}

export async function logoutUser(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (uid) {
    try {
      await setOffline(uid);
    } catch {
      // Presence is best effort; never block sign out.
    }
  }
  await signOut(auth);
}

export function subscribeAuth(
  cb: (user: AuthUser | null) => void,
): Unsubscribe {
  return onAuthStateChanged(auth, user => {
    if (!user) {
      cb(null);
      return;
    }
    const email = user.email ?? '';
    cb({
      uid: user.uid,
      name: user.displayName ?? email.split('@')[0],
      email,
    });
  });
}

export function mapAuthError(code: string): string {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Sai email hoặc mật khẩu.';
    case 'auth/email-already-in-use':
      return 'Email đã được đăng ký.';
    case 'auth/weak-password':
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    case 'auth/invalid-email':
      return 'Email không hợp lệ.';
    case 'auth/network-request-failed':
      return 'Không có kết nối mạng. Vui lòng thử lại.';
    default:
      return 'Đã xảy ra lỗi. Vui lòng thử lại.';
  }
}
