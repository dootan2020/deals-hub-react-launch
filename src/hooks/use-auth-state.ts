
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
  const [authError, setAuthError] = useState<Error | null>(null);
  // Add a cache for roles to prevent unnecessary fetches
  const [lastRolesFetchTime, setLastRolesFetchTime] = useState<number | null>(null);
  const rolesCacheDuration = 60000; // Cache roles for 1 minute

  // Function to fetch user roles
  const fetchUserRoles = useCallback(async (userId: string, forceFetch = false) => {
    // Check if we have recently fetched roles and can use the cache
    const now = Date.now();
    if (!forceFetch && lastRolesFetchTime && now - lastRolesFetchTime < rolesCacheDuration) {
      console.log('Using cached roles data');
      return;
    }

    try {
      console.log('Fetching user roles from database');
      const { data, error } = await supabase
        .rpc('get_user_roles', { user_id_param: userId })
        .abortSignal(AbortSignal.timeout(3000)); // 3s timeout

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
        setLastRolesFetchTime(now);
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      setUserRoles([]);
      setIsAdmin(false);
      setIsStaff(false);
    }
  }, [lastRolesFetchTime]);

  // Function to fetch user balance
  const fetchUserBalance = useCallback(async (userId: string) => {
    if (!userId) return;
    
    try {
      setIsLoadingBalance(true);
      console.log('Fetching balance for user in useAuthState:', userId);

      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .abortSignal(AbortSignal.timeout(3000)) // 3s timeout
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
      
      // When we get a valid session, proceed with fetching additional data
      // Use requestIdleCallback or setTimeout to defer non-critical operations
      const deferredFetch = () => {
        if (authUser.id) {
          console.log('Deferring role and balance fetch for better performance');
          fetchUserRoles(authUser.id);
          fetchUserBalance(authUser.id);
        }
      };
      
      // Use requestIdleCallback if available, otherwise fall back to setTimeout
      if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
        window.requestIdleCallback(deferredFetch, { timeout: 1000 });
      } else {
        setTimeout(deferredFetch, 100);
      }
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
    let authTimeout: NodeJS.Timeout;
    
    const initializeAuth = async () => {
      try {
        // First set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          if (isMounted) {
            handleAuthStateChange(event, currentSession);
          }
        });
        
        // Then check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setAuthError(error);
          if (isMounted) setLoading(false);
          return;
        }
        
        if (isMounted) {
          if (data.session) {
            handleAuthStateChange('INITIAL_SESSION', data.session);
          } else {
            console.log('No existing session found');
          }
          
          // Always set loading to false regardless of session status
          setLoading(false);
        }
        
        // Cleanup function will be returned by useEffect
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Error in initializeAuth:', error);
        if (error instanceof Error) {
          setAuthError(error);
        } else {
          setAuthError(new Error('Unknown auth error'));
        }
        if (isMounted) setLoading(false);
      }
    };
    
    // Set a safety timeout to prevent infinite loading
    authTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.error('Auth initialization timeout reached');
        setLoading(false);
        setAuthError(new Error('Authentication timed out'));
      }
    }, 5000);
    
    initializeAuth();
    
    return () => {
      isMounted = false;
      clearTimeout(authTimeout);
    };
  }, [handleAuthStateChange, loading]);

  // Function to manually refresh user profile data with forced role fetch
  const refreshUserData = useCallback(async () => {
    if (!user) return;
    
    try {
      // Force fetch roles even if cache is still valid
      await fetchUserRoles(user.id, true);
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
    isLoadingBalance,
    authError
  };
};
