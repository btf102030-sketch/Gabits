import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthAPI, UsersAPI, User, saveToken, getToken, clearToken } from '../services/api';

type AuthState = {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  needsOnboarding: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const bootstrap = useCallback(async () => {
    try {
      const token = await getToken();
      if (!token) { setUser(null); return; }
      const me = await UsersAPI.me();
      setUser(me ?? null);
    } catch (e) {
      console.warn('auth bootstrap failed', e);
      try { await clearToken(); } catch {}
      setUser(null);
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await AuthAPI.login(email, password);
    if (res?.token) await saveToken(res.token);
    try { const me = await UsersAPI.me(); setUser(me ?? res?.user ?? null); }
    catch { setUser(res?.user ?? null); }
  }, []);

  const signup = useCallback(async (email: string, password: string, name: string) => {
    const res = await AuthAPI.signup(email, password, name);
    if (res?.token) await saveToken(res.token);
    setUser(res?.user ?? null);
  }, []);

  const logout = useCallback(async () => { await clearToken(); setUser(null); }, []);

  const refresh = useCallback(async () => {
    try { const me = await UsersAPI.me(); setUser(me ?? null); } catch { setUser(null); }
  }, []);

  const completeOnboarding = useCallback(async () => {
    const u = await UsersAPI.updateOnboarding({ onboardingCompleted: true });
    setUser(u ?? null);
  }, []);

  const value = useMemo<AuthState>(() => ({
    user, isLoading,
    isAuthenticated: !!user,
    needsOnboarding: !!user && !user.onboardingCompleted,
    login, signup, logout, refresh, completeOnboarding,
  }), [user, isLoading, login, signup, logout, refresh, completeOnboarding]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
