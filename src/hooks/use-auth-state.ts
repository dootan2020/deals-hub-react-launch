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
  const initializationTimeRef = useRef<number>(Date.now());

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
      toast({
        title: 'Không thể cập nhật thông tin người dùng',
        description: 'Vui lòng tải lại trang',
        variant: 'destructive'
      });
    }
  }, [user?.id, fetchUserRoles, fetchUserBalance]);

  // Explicit function to handle session changes from auth events
  const handleAuthStateChange = useCallback(async (event: string, currentSession: any) => {
    console.debug('Auth state change event:', event);
    
    // Always update the session state immediately
    setSession(currentSession);
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (currentSession?.user) {
        console.log('User signed in or token refreshed:', currentSession.user.email);
        
        // Update user state immediately to improve perceived performance
        setUser(currentSession.user as unknown as User);
        
        // Set loading to false as soon as we have user data
        setLoading(false);
        
        // Fetch additional user data in the background without blocking UI
        if (event === 'SIGNED_IN' || !authInitialized) {
          const start = performance.now();
          
          // First set roles to empty array to avoid showing incorrect roles momentarily
          setUserRoles([]);
          
          try {
            // Fetch roles first (higher priority)
            const roles = await fetchUserRoles(currentSession.user.id);
            setUserRoles(roles);
            console.log(`Roles loaded in ${(performance.now() - start).toFixed(1)}ms:`, roles);
            
            // Then fetch balance (lower priority) - don't await to avoid blocking
            fetchUserBalance(currentSession.user.id)
              .then(balance => {
                console.log(`Balance loaded in ${(performance.now() - start).toFixed(1)}ms:`, balance);
              })
              .catch(err => {
                console.error('Error loading balance:', err);
                // Still set a default balance to avoid UI issues
                setUserBalance(0);
              });
          } catch (err) {
            console.error('Error loading user data:', err);
            // Set defaults to avoid UI issues
            setUserRoles([]);
            setUserBalance(0);
          }
        }
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      setUser(null);
      setUserRoles([]);
      setUserBalance(0);
      setSession(null);
      setLoading(false);
    } else if (event === 'INITIAL_SESSION') {
      // For initial session, set user/session immediately if available
      if (currentSession) {
        setUser(currentSession.user as unknown as User);
      }
      
      // Always set loading to false regardless of result
      const delay = Date.now() - initializationTimeRef.current;
      console.log(`Initial session check completed in ${delay}ms`, 
                 currentSession ? 'with session' : 'without session');
      setLoading(false);
    }
    
    // If this is not initialization and the session changed significantly,
    // we should refresh user data
    if (authInitialized && 
        event !== 'INITIAL_SESSION' && 
        currentSession?.user?.id !== user?.id) {
      // Data needs refreshing due to significant session change
      if (currentSession?.user) {
        Promise.all([
          fetchUserRoles(currentSession.user.id).then(setUserRoles),
          fetchUserBalance(currentSession.user.id)
        ]).catch(err => {
          console.error('Error refreshing user data after session change:', err);
        });
      }
    }
  }, [authInitialized, fetchUserBalance, fetchUserRoles, user?.id]);

  // Initial auth state check
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        initializationTimeRef.current = Date.now();
        
        // First set up the auth listener to catch any changes
        authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
        
        // Add debug info
        console.log('Auth listener registered at', new Date().toISOString());
        
        // Then get the initial session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching initial session:', error);
          setAuthError(error);
          setLoading(false); // Don't keep the UI blocked on error
        } else {
          console.log('Initial session check:', data.session ? 'Session found' : 'No session');
          
          // Immediately set user and session
          setUser(data.session?.user as unknown as User || null);
          setSession(data.session);
          
          // If we have a session, start loading additional data while setting loading to false
          if (data.session?.user) {
            // Set loading to false now that we have the basic session
            setLoading(false);
            
            // Load additional data in the background
            Promise.all([
              fetchUserRoles(data.session.user.id).then(setUserRoles),
              fetchUserBalance(data.session.user.id)
            ]).catch(err => {
              console.error('Error loading additional user data:', err);
            });
          } else {
            // No session, just set loading to false
            setLoading(false);
          }
        }
        
        setAuthInitialized(true);
      } catch (error: any) {
        console.error('Error in auth initialization:', error);
        setAuthError(error);
        setLoading(false); // Don't keep the UI blocked on error
        
        // Show toast for auth initialization error
        toast({
          title: 'Lỗi khởi tạo xác thực',
          description: 'Không thể khởi tạo phiên đăng nhập. Vui lòng tải lại trang.',
          variant: 'destructive'
        });
      }
      
      // Failsafe to ensure loading state is cleared
      const failsafeTimer = setTimeout(() => {
        if (loading) {
          console.warn('Auth initialization taking too long, clearing loading state as a failsafe');
          setLoading(false);
        }
      }, 3000); // Shortened failsafe timeout to 3 seconds
      
      return () => clearTimeout(failsafeTimer);
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
  }, [handleAuthStateChange, fetchUserRoles, fetchUserBalance, loading]);

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
