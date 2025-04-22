
import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { toast } from 'sonner';

export const useSessionManagement = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const authListenerRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);
  const initializationTimeRef = useRef<number>(Date.now());

  const handleAuthStateChange = useCallback(async (event: string, currentSession: Session | null) => {
    console.debug('Auth state change event:', event);
    setSession(currentSession);
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (currentSession?.user) {
        console.log('User signed in or token refreshed:', currentSession.user.email);
        setUser(currentSession.user);
        setLoading(false);
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      setUser(null);
      setSession(null);
      setLoading(false);
    } else if (event === 'INITIAL_SESSION') {
      if (currentSession) {
        setUser(currentSession.user);
      }
      const delay = Date.now() - initializationTimeRef.current;
      console.log(`Initial session check completed in ${delay}ms`, 
                 currentSession ? 'with session' : 'without session');
      setLoading(false);
    }
  }, []);

  return {
    user,
    session,
    loading,
    authError,
    setAuthError,
    authInitialized,
    setAuthInitialized,
    handleAuthStateChange,
    authListenerRef,
    initializationTimeRef,
    setLoading,
    setUser,
    setSession
  };
};
