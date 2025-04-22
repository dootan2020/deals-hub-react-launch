
import { useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthError } from '@/types';
import { authMonitoring } from '@/utils/auth/auth-monitoring';

export const useSessionEvents = (
  updateSession: (session: any) => void,
  initializeAuth: () => void
) => {
  const authListenerRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);
  const initializationTimeRef = useRef<number>(Date.now());

  const handleAuthStateChange = useCallback((event: string, currentSession: any) => {
    console.debug('Auth state change event:', event);
    
    switch (event) {
      case 'SIGNED_IN':
      case 'TOKEN_REFRESHED':
        updateSession(currentSession);
        break;
      case 'SIGNED_OUT':
        updateSession(null);
        break;
      case 'INITIAL_SESSION':
        updateSession(currentSession);
        const delay = Date.now() - initializationTimeRef.current;
        console.log(`Initial session check completed in ${delay}ms`);
        initializeAuth();
        break;
    }

    authMonitoring.logEvent({ type: event.toLowerCase() });
  }, [updateSession, initializeAuth]);

  useEffect(() => {
    const setupAuth = async () => {
      try {
        // Set up auth listener
        authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);

        // Get initial session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        handleAuthStateChange('INITIAL_SESSION', session);
      } catch (error) {
        console.error('Auth initialization error:', error);
        authMonitoring.notifyAuthIssue('Auth Error', (error as AuthError).message);
      }
    };

    setupAuth();

    return () => {
      if (authListenerRef.current) {
        authListenerRef.current.data.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [handleAuthStateChange]);

  return { handleAuthStateChange };
};
