
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, UserRole } from '@/types/auth.types';
import { toast } from '@/hooks/use-toast';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const authListenerRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);

  // Computed properties
  const isAdmin = userRoles.includes('admin');
  const isStaff = userRoles.includes('staff');

  // Fetch roles for the current user
  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      console.debug(`Fetching roles for user ${userId}`);
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
    console.debug(`Fetching balance for user ${userId}`);
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
    console.debug('Refreshing user data');
    if (!user?.id) return;
    
    try {
      const roles = await fetchUserRoles(user.id);
      setUserRoles(roles);
      
      await fetchUserBalance(user.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Không thể cập nhật thông tin người dùng', 'Vui lòng tải lại trang');
    }
  }, [user?.id, fetchUserRoles, fetchUserBalance]);

  // Explicit function to handle session changes from auth events
  const handleAuthStateChange = useCallback(async (event: string, currentSession: any) => {
    console.debug('Auth state change event:', event);
    
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
  }, [authInitialized, fetchUserBalance, fetchUserRoles, user?.id]);

  // Initial auth state check
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        
        // First set up the auth listener to catch any changes
        authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
        
        // Then get the initial session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching initial session:', error);
          setAuthError(error);
        } else {
          console.log('Initial session check:', data.session ? 'Session found' : 'No session');
          
          // Manually handle initial session state to ensure consistency
          await handleAuthStateChange('INITIAL_SESSION', data.session);
        }
        
        setAuthInitialized(true);
      } catch (error: any) {
        console.error('Error in auth initialization:', error);
        setAuthError(error);
        // Show toast for auth initialization error
        toast.error(
          'Lỗi khởi tạo xác thực', 
          'Không thể khởi tạo phiên đăng nhập. Vui lòng tải lại trang.'
        );
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
    
    return () => {
      // Clean up the auth listener
      if (authListenerRef.current) {
        console.log('Cleaning up auth listener');
        authListenerRef.current.data.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [handleAuthStateChange]);

  // Set up a periodic health check for the listener
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!authListenerRef.current) {
        console.warn('Auth listener not found, reinitializing...');
        authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(checkInterval);
  }, [handleAuthStateChange]);
  
  // Set up session expiry monitoring
  useEffect(() => {
    if (session?.expires_at) {
      const checkExpiryInterval = setInterval(() => {
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at;
        const timeUntilExpiry = expiresAt - now;
        
        // If session expires in less than 5 minutes, try to refresh it
        if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
          console.log(`Session expires in ${timeUntilExpiry} seconds, refreshing...`);
          supabase.auth.refreshSession()
            .then(({ data, error }) => {
              if (error) {
                console.error('Failed to refresh session:', error);
              } else if (data.session) {
                console.log('Session refreshed, new expiry:',
                  new Date(data.session.expires_at * 1000).toLocaleString());
              }
            });
        }
      }, 30000); // Check every 30 seconds
      
      return () => clearInterval(checkExpiryInterval);
    }
  }, [session]);

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
