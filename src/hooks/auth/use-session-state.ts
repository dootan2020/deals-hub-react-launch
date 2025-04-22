
import { useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authMonitoring } from '@/utils/auth/auth-monitoring';

export const useSessionState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  const updateSession = useCallback((newSession: Session | null) => {
    setSession(newSession);
    setUser(newSession?.user ?? null);
    authMonitoring.logEvent({
      type: newSession ? 'session_update' : 'session_clear',
      metadata: { userId: newSession?.user?.id }
    });
  }, []);

  const initializeAuth = useCallback(() => {
    setAuthInitialized(true);
    setLoading(false);
  }, []);

  return {
    user,
    session,
    loading,
    authInitialized,
    updateSession,
    initializeAuth,
    setLoading
  };
};
