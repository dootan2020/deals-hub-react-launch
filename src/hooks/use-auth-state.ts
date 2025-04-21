
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
  const [authInitialized, setAuthInitialized] = useState(false);

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
    let authListener: { data: { subscription: { unsubscribe: () => void } } };
    
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // First set up the auth listener to catch any changes
        authListener = supabase.auth.onAuthStateChange(
          async (event, currentSession) => {
            console.log('Auth state change event:', event);
            
            setSession(currentSession);
            
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              if (currentSession?.user) {
                console.log('User signed in or token refreshed:', currentSession.user.email);
                setUser(currentSession.user as User);
                
                // Only fetch roles and balance if this is an actual sign-in
                // (not just a page refresh with existing session)
                if (event === 'SIGNED_IN' || !authInitialized) {
                  const roles = await fetchUserRoles(currentSession.user.id);
                  setUserRoles(roles);
                  await fetchUserBalance(currentSession.user.id);
                }
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('User signed out');
              setUser(null);
              setUserRoles([]);
              setUserBalance(0);
              setSession(null);
            }
            
            // If this is not initialization and the session changed significantly,
            // we should refresh user data
            if (authInitialized && 
                event !== 'INITIAL_SESSION' && 
                currentSession?.user?.id !== user?.id) {
              // Data needs refreshing due to significant session change
              if (currentSession?.user) {
                const roles = await fetchUserRoles(currentSession.user.id);
                setUserRoles(roles);
                await fetchUserBalance(currentSession.user.id);
              }
            }
          }
        );
        
        // Then get the initial session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching initial session:', error);
          setAuthError(error);
        } else {
          console.log('Initial session check:', data.session ? 'Session found' : 'No session');
          setSession(data.session);
          
          if (data.session?.user) {
            console.log('Initial user:', data.session.user.email);
            setUser(data.session.user as User);
            
            // Load user data
            const roles = await fetchUserRoles(data.session.user.id);
            setUserRoles(roles);
            await fetchUserBalance(data.session.user.id);
          }
        }
        
        setAuthInitialized(true);
      } catch (error: any) {
        console.error('Error in auth initialization:', error);
        setAuthError(error);
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    return () => {
      // Clean up the auth listener
      if (authListener) {
        authListener.data.subscription.unsubscribe();
      }
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
