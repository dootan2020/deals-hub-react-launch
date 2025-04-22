
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth.types';
import { useDebouncedCallback } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import { AuthState } from './auth-types';

export const useAuthState = (): AuthState & { 
  setUserBalance: (balance: number) => void 
} => {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true,
    isAuthenticated: false,
    authError: null,
    isAdmin: false,
    isStaff: false,
    userRoles: [],
    userBalance: 0,
    isLoadingBalance: false
  });

  const cleanupRef = useRef<(() => void)[]>([]);
  const authSubscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const isInitializedRef = useRef(false);

  // Debounced session update
  const updateSession = useDebouncedCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        isAuthenticated: !!session?.user,
        loading: false
      }));
    } catch (error) {
      console.error('Session update error:', error);
      setState(prev => ({ ...prev, loading: false }));
    }
  }, 300);

  // Handle auth state changes
  const handleAuthChange = useCallback((event: string, session: any) => {
    console.log('Auth state change:', event);
    setState(prev => ({
      ...prev,
      session,
      user: session?.user ?? null,
      isAuthenticated: !!session?.user,
      loading: false
    }));

    // Fetch user data after auth state change
    if (session?.user) {
      setTimeout(() => {
        void fetchUserData(session.user.id);
      }, 0);
    }
  }, []);

  // Fetch user roles and balance
  const fetchUserData = async (userId: string) => {
    try {
      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', userId);

      const { data: profile } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      setState(prev => ({
        ...prev,
        userRoles: roles?.map(r => r.role) ?? [],
        isAdmin: roles?.some(r => r.role === 'admin') ?? false,
        isStaff: roles?.some(r => r.role === 'staff' || r.role === 'admin') ?? false,
        userBalance: profile?.balance ?? 0
      }));
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  // Initialize auth state
  useEffect(() => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;

    // Set up auth subscription first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthChange);
    authSubscriptionRef.current = subscription;

    // Check initial session
    void updateSession();

    // Auto refresh session when window regains focus
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void updateSession();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup function
    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];
    };
  }, [handleAuthChange, updateSession]);

  // Expose balance setter
  const setUserBalance = useCallback((balance: number) => {
    setState(prev => ({ ...prev, userBalance: balance }));
  }, []);

  return { ...state, setUserBalance };
};
