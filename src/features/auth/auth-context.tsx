import React, { createContext, useContext, useEffect, useState } from 'react';
import { subscribeAuth } from '../../services/auth-service';
import { startPresence } from '../../services/presence-service';
import type { AuthUser } from '../../services/types';

type AuthState = { user: AuthUser | null; initializing: boolean };

const AuthContext = createContext<AuthState>({
  user: null,
  initializing: true,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    initializing: true,
  });

  useEffect(() => {
    const unsubscribe = subscribeAuth(user =>
      setState({ user, initializing: false }),
    );
    return unsubscribe;
  }, []);

  const uid = state.user?.uid;
  useEffect(() => {
    if (!uid) {
      return undefined;
    }
    return startPresence(uid);
  }, [uid]);

  return <AuthContext.Provider value={state}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  return useContext(AuthContext);
}
