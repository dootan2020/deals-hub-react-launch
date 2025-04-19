
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
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching user balance:', error);
        return;
      }

      if (data) {
        setUserBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
    }
  }, []);

  // Function to handle auth state changes
  const handleAuthStateChange = useCallback((event: string, currentSession: Session | null) => {
    console.log('Auth state changed:', event, currentSession?.user?.id);
    
    setSession(currentSession);
    
    if (currentSession?.user) {
      const authUser = { ...currentSession.user } as AuthUser;
      setUser(authUser);
      
      // Use setTimeout to avoid potential Supabase auth deadlocks
      setTimeout(() => {
        fetchUserRoles(authUser.id);
        fetchUserBalance(authUser.id);
      }, 0);
    } else {
      setUser(null);
      setIsAdmin(false);
      setIsStaff(false);
      setUserRoles([]);
      setUserBalance(0);
    }
  }, [fetchUserRoles, fetchUserBalance]);

  useEffect(() => {
    // First set up the auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(handleAuthStateChange);

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      handleAuthStateChange('INITIAL_SESSION', currentSession);
      setLoading(false);
    }).catch(error => {
      console.error('Error getting session:', error);
      setLoading(false);
    });

    // Clean up the subscription
    return () => {
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
    refreshUserData
  };
};
