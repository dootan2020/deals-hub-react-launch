
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth.types';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  // Computed properties
  const isAdmin = userRoles.includes('admin');
  const isStaff = userRoles.includes('staff');

  // Fetch roles for the current user
  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase.rpc('get_user_roles', {
        user_id_param: userId
      });
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      return data as UserRole[];
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  }, []);

  // Fetch user balance
  const fetchUserBalance = useCallback(async (userId: string) => {
    setIsLoadingBalance(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user balance:', error);
        return 0;
      }
      
      const balance = data?.balance || 0;
      setUserBalance(balance);
      return balance;
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
      return 0;
    } finally {
      setIsLoadingBalance(false);
    }
  }, []);

  // Refresh user data (roles, balance, etc)
  const refreshUserData = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      const roles = await fetchUserRoles(user.id);
      setUserRoles(roles);
      
      await fetchUserBalance(user.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  }, [user?.id, fetchUserRoles, fetchUserBalance]);

  // Initial auth state check
  useEffect(() => {
    const fetchInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
          setAuthError(error);
        }
        
        setSession(data.session);
        
        if (data.session?.user) {
          setUser(data.session.user as User);
          const roles = await fetchUserRoles(data.session.user.id);
          setUserRoles(roles);
          await fetchUserBalance(data.session.user.id);
        }
      } catch (error: any) {
        console.error('Error in initial session check:', error);
        setAuthError(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialSession();
    
    // Listen for auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user as User);
          const roles = await fetchUserRoles(session.user.id);
          setUserRoles(roles);
          await fetchUserBalance(session.user.id);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setUserRoles([]);
          setUserBalance(0);
        }
      }
    );
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [fetchUserRoles, fetchUserBalance]);

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
    refreshUserData,
    isLoadingBalance,
    authError
  };
};
