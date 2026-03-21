import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { UserRole } from '@/types/restaurant';
import {
  type AppUser,
  signInWithDatabase,
  signOutDatabaseSession,
  signUpWithDatabase,
  validateDatabaseSession,
} from '@/lib/customAuthApi';

const SESSION_STORAGE_KEY = 'rms_session_token';

type AuthContextType = {
  user: AppUser | null;
  roles: UserRole[];
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  hasRole: (role: UserRole) => boolean;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const token = localStorage.getItem(SESSION_STORAGE_KEY);
        if (!token) return;

        const session = await validateDatabaseSession(token);
        if (!session) {
          localStorage.removeItem(SESSION_STORAGE_KEY);
          return;
        }

        setUser(session.user);
        setRoles(session.roles);
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const session = await signInWithDatabase(email, password);
    localStorage.setItem(SESSION_STORAGE_KEY, session.token);
    setUser(session.user);
    setRoles(session.roles);
  }, []);

  const signUp = useCallback(async (email: string, password: string, fullName: string, role: UserRole) => {
    await signUpWithDatabase(email, password, fullName, role);
    const session = await signInWithDatabase(email, password);
    localStorage.setItem(SESSION_STORAGE_KEY, session.token);
    setUser(session.user);
    setRoles(session.roles);
  }, []);

  const signOut = useCallback(async () => {
    const token = localStorage.getItem(SESSION_STORAGE_KEY);
    if (token) {
      await signOutDatabaseSession(token);
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
    setUser(null);
    setRoles([]);
  }, []);

  const hasRole = useCallback((role: UserRole) => roles.includes(role), [roles]);

  const value = useMemo(
    () => ({ user, roles, loading, signIn, signUp, signOut, hasRole }),
    [user, roles, loading, signIn, signUp, signOut, hasRole],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
