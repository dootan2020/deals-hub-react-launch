
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthUser, UserRole } from '@/types/auth.types';
import type { Session, User } from '@supabase/supabase-js';

export const useAuthState = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);

  // Function to fetch user roles
  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      const { data, error } = await (supabase as any)
        .rpc('get_user_roles', { user_id_param: userId });

      if (error) {
        console.error('Error fetching user roles:', error);
        setUserRoles([]);
        setIsAdmin(false);
        setIsStaff(false);
        return;
      }

      if (data) {
        const roles = data as UserRole[];
        setUserRoles(roles);
        setIsAdmin(roles.includes('admin'));
        setIsStaff(roles.includes('staff'));
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      setUserRoles([]);
      setIsAdmin(false);
      setIsStaff(false);
    }
  }, []);

  // Function to fetch user balance
  const fetchUserBalance = useCallback(async (userId: string) => {
    if (!userId) return;
    
    try {
      setIsLoadingBalance(true);
      console.log('Fetching balance for user in useAuthState:', userId);

      // Force refresh the session before fetching balance
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session refresh error in useAuthState:', sessionError);
        return;
      }
      
      if (!sessionData.session) {
        console.error('No active session found in useAuthState');
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .abortSignal(AbortSignal.timeout(5000)) // 5s timeout
        .single();

      if (error) {
        console.error('Error fetching user balance in useAuthState:', error);
        return;
      }

      if (data && typeof data.balance === 'number') {
        console.log('Balance fetched successfully in useAuthState:', data.balance);
        setUserBalance(data.balance);
      } else {
        console.warn('No valid balance data received in useAuthState');
      }
    } catch (error) {
      console.error('Exception in fetchUserBalance useAuthState:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  // Function to handle auth state changes
  const handleAuthStateChange = useCallback((event: string, currentSession: Session | null) => {
    console.log('Auth state changed:', event, currentSession?.user?.id);
    
    setSession(currentSession);
    
    if (currentSession?.user) {
      const authUser = { ...currentSession.user } as AuthUser;
      setUser(authUser);
      
      // Fetch user data immediately after setting user
      fetchUserRoles(authUser.id);
      fetchUserBalance(authUser.id);
    } else {
      setUser(null);
      setIsAdmin(false);
      setIsStaff(false);
      setUserRoles([]);
      setUserBalance(0);
    }
  }, [fetchUserRoles, fetchUserBalance]);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (isMounted) {
        handleAuthStateChange(event, currentSession);
      }
    });

    // Then check for existing session only once on mount
    const initializeAuth = async () => {
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        if (isMounted) {
          // Only call if component is mounted
          if (currentSession) {
            handleAuthStateChange('INITIAL_SESSION', currentSession);
          } else {
            console.log('No existing session found');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('Error getting session:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Clean up function
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [handleAuthStateChange]);

  // Function to manually refresh user profile data
  const refreshUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      await fetchUserRoles(user.id);
      await fetchUserBalance(user.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [user, fetchUserRoles, fetchUserBalance]);

  return {
    user,
    session,
    loading,
    isAdmin,
    isStaff,
    userRoles,
    userBalance,
    setUserBalance,
    fetchUserBalance,
    fetchUserRoles,
    refreshUserData,
    isLoadingBalance
  };
};
