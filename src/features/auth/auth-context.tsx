import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { subscribeAuth } from '../../services/auth-service';
import { startPresence } from '../../services/presence-service';
import { subscribeUser } from '../../services/user-service';
import type { AuthUser } from '../../services/types';

type AuthState = { user: AuthUser | null; initializing: boolean };

const AuthContext = createContext<AuthState>({
  user: null,
  initializing: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = subscribeAuth(user => {
      setAuthUser(user);
      setInitializing(false);
    });
    return unsubscribe;
  }, []);

  const uid = authUser?.uid;
  useEffect(() => {
    if (!uid) {
      return undefined;
    }
    return startPresence(uid);
  }, [uid]);

  // users/{uid}/name là nguồn tên chuẩn: luật bảo mật so peerName với nó, và
  // displayName của Firebase Auth có thể chưa kịp cập nhật ngay sau khi đăng ký.
  useEffect(() => {
    setProfileName(null);
    if (!uid) {
      return undefined;
    }
    return subscribeUser(uid, profile => setProfileName(profile?.name ?? null));
  }, [uid]);

  const user = useMemo(
    () => (authUser ? { ...authUser, name: profileName ?? authUser.name } : null),
    [authUser, profileName],
  );
  const value = useMemo(() => ({ user, initializing }), [user, initializing]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
