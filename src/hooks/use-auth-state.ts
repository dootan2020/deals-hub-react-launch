
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
  const dataRefreshInProgressRef = useRef<boolean>(false);

  // Computed properties
  const isAdmin = userRoles.includes('admin');
  const isStaff = userRoles.includes('staff');

  // Fetch roles for the current user - with caching
  const fetchUserRoles = useCallback(async (userId: string) => {
    try {
      // Check if we have roles in local storage and they're not older than 5 minutes
      const cachedRolesData = localStorage.getItem(`user_roles_${userId}`);
      if (cachedRolesData) {
        const { roles, timestamp } = JSON.parse(cachedRolesData);
        const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
        
        if (timestamp > fiveMinutesAgo) {
          console.debug('Using cached user roles');
          return roles as UserRole[];
        }
      }
      
      console.debug(`Fetching roles for user ${userId}`);
      const { data, error } = await supabase.rpc('get_user_roles', {
        user_id_param: userId
      });
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return [];
      }
      
      // Cache roles in localStorage with timestamp
      localStorage.setItem(`user_roles_${userId}`, JSON.stringify({
        roles: data,
        timestamp: Date.now()
      }));
      
      return data as UserRole[];
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
      return [];
    }
  }, []);

  // Fetch user balance with caching
  const fetchUserBalance = useCallback(async (userId: string) => {
    if (isLoadingBalance) return userBalance; // Prevent concurrent balance fetch requests
    
    console.debug(`Fetching balance for user ${userId}`);
    setIsLoadingBalance(true);
    
    try {
      // Check for cached balance that's not older than 30 seconds
      const cachedBalanceData = localStorage.getItem(`user_balance_${userId}`);
      if (cachedBalanceData) {
        const { balance, timestamp } = JSON.parse(cachedBalanceData);
        const thirtySecondsAgo = Date.now() - 30 * 1000;
        
        if (timestamp > thirtySecondsAgo) {
          console.debug('Using cached user balance');
          setUserBalance(balance);
          return balance;
        }
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching user balance:', error);
        return userBalance; // Return current balance on error
      }
      
      const balance = data?.balance || 0;
      setUserBalance(balance);
      
      // Cache balance in localStorage
      localStorage.setItem(`user_balance_${userId}`, JSON.stringify({
        balance,
        timestamp: Date.now()
      }));
      
      return balance;
    } catch (error) {
      console.error('Error in fetchUserBalance:', error);
      return userBalance; // Return current balance on error
    } finally {
      setIsLoadingBalance(false);
    }
  }, [userBalance, isLoadingBalance]);

  // Refresh user data (roles, balance, etc) - with debounce
  const refreshUserData = useCallback(async () => {
    if (!user?.id || dataRefreshInProgressRef.current) return;
    
    console.debug('Refreshing user data');
    dataRefreshInProgressRef.current = true;
    
    try {
      // First fetch roles as they're more critical
      const roles = await fetchUserRoles(user.id);
      setUserRoles(roles);
      
      // Then fetch balance with a small delay to avoid parallel requests
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchUserBalance(user.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast({
        title: 'Không thể cập nhật thông tin người dùng',
        description: 'Vui lòng tải lại trang',
        variant: 'destructive'
      });
    } finally {
      dataRefreshInProgressRef.current = false;
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
          
          // Use Promise.all but with a sequential approach for better performance
          const loadUserData = async () => {
            try {
              // Fetch roles first (higher priority)
              const roles = await fetchUserRoles(currentSession.user.id);
              setUserRoles(roles);
              console.log(`Roles loaded in ${(performance.now() - start).toFixed(1)}ms:`, roles);
              
              // Small delay before loading balance to avoid parallel requests
              await new Promise(resolve => setTimeout(resolve, 300));
              
              // Then fetch balance (lower priority)
              const balance = await fetchUserBalance(currentSession.user.id);
              console.log(`Balance loaded in ${(performance.now() - start).toFixed(1)}ms:`, balance);
            } catch (err) {
              console.error('Error loading user data:', err);
              // Set defaults to avoid UI issues
              setUserRoles([]);
              setUserBalance(0);
            }
          };
          
          // Start loading data in background
          loadUserData();
        }
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      setUser(null);
      setUserRoles([]);
      setUserBalance(0);
      setSession(null);
      setLoading(false);
      
      // Clear cached user data
      if (user?.id) {
        localStorage.removeItem(`user_roles_${user.id}`);
        localStorage.removeItem(`user_balance_${user.id}`);
      }
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
        // Use sequential loading with small delays to avoid parallel requests
        const sequentialLoad = async () => {
          const roles = await fetchUserRoles(currentSession.user.id);
          setUserRoles(roles);
          
          await new Promise(resolve => setTimeout(resolve, 300));
          await fetchUserBalance(currentSession.user.id);
        };
        
        sequentialLoad().catch(err => {
          console.error('Error refreshing user data after session change:', err);
        });
      }
    }
  }, [authInitialized, fetchUserBalance, fetchUserRoles, user?.id]);

  // Initial auth state check - optimized to be faster and more reliable
  useEffect(() => {
    let isMounted = true;
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
          if (isMounted) setLoading(false); // Don't keep the UI blocked on error
        } else {
          console.log('Initial session check:', data.session ? 'Session found' : 'No session');
          
          // Immediately set user and session
          if (isMounted) {
            setUser(data.session?.user as unknown as User || null);
            setSession(data.session);
          }
          
          // If we have a session, start loading additional data while setting loading to false
          if (data.session?.user) {
            // Set loading to false now that we have the basic session
            if (isMounted) setLoading(false);
            
            // Load additional data in the background with sequential approach
            const loadAdditionalData = async () => {
              try {
                // First roles
                const roles = await fetchUserRoles(data.session.user.id);
                if (isMounted) setUserRoles(roles);
                
                // Small delay before requesting balance
                await new Promise(resolve => setTimeout(resolve, 300));
                
                // Then balance
                await fetchUserBalance(data.session.user.id);
              } catch (err) {
                console.error('Error loading additional user data:', err);
              }
            };
            
            loadAdditionalData();
          } else {
            // No session, just set loading to false
            if (isMounted) setLoading(false);
          }
        }
        
        if (isMounted) setAuthInitialized(true);
      } catch (error: any) {
        console.error('Error in auth initialization:', error);
        if (isMounted) {
          setAuthError(error);
          setLoading(false); // Don't keep the UI blocked on error
        }
        
        // Show toast for auth initialization error
        toast({
          title: 'Lỗi khởi tạo xác thực',
          description: 'Không thể khởi tạo phiên đăng nhập. Vui lòng tải lại trang.',
          variant: 'destructive'
        });
      }
      
      // Failsafe to ensure loading state is cleared - reduced from 3s to 2s
      const failsafeTimer = setTimeout(() => {
        if (isMounted && loading) {
          console.warn('Auth initialization taking too long, clearing loading state as a failsafe');
          setLoading(false);
        }
      }, 2000); // Shorter failsafe timeout
      
      return () => clearTimeout(failsafeTimer);
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
      // Clean up the auth listener
      if (authListenerRef.current) {
        console.log('Cleaning up auth listener');
        authListenerRef.current.data.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [handleAuthStateChange, fetchUserRoles, fetchUserBalance, loading]);

  // Set up a periodic health check for the listener - reduced frequency
  useEffect(() => {
    const checkInterval = setInterval(() => {
      if (!authListenerRef.current) {
        console.warn('Auth listener not found, reinitializing...');
        authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
      }
    }, 120000); // Check every 2 minutes (reduced from 1 minute)
    
    return () => clearInterval(checkInterval);
  }, [handleAuthStateChange]);
  
  // Set up session expiry monitoring - optimized
  useEffect(() => {
    if (!session?.expires_at) return;
    
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
    }, 60000); // Check every minute (increased from 30 seconds)
    
    return () => clearInterval(checkExpiryInterval);
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
