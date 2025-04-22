
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth.types';
import { useUserDataFetch } from './useUserDataFetch';
import { useSessionMonitoring } from './useSessionMonitoring';
import { toast } from 'sonner';

/**
 * Core hook for managing authentication state
 * This separates auth state management from the context to make it more testable
 */
export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);
  const [authInitialized, setAuthInitialized] = useState(false);
  const authListenerRef = useRef<{ data: { subscription: { unsubscribe: () => void } } } | null>(null);
  const initializationTimeRef = useRef<number>(Date.now());
  const dataRefreshInProgressRef = useRef<boolean>(false);

  const {
    userRoles,
    setUserRoles,
    userBalance,
    setUserBalance,
    isLoadingBalance,
    fetchUserRoles,
    fetchUserBalance
  } = useUserDataFetch();

  // Monitor session for expiry
  useSessionMonitoring(session);

  // Computed properties
  const isAdmin = userRoles.includes('admin');
  const isStaff = userRoles.includes('staff');
  const isAuthenticated = !!user && !!session;

  // Refresh user data (roles, balance, etc)
  const refreshUserData = useCallback(async () => {
    if (!user?.id || dataRefreshInProgressRef.current) return;
    
    console.debug('Refreshing user data');
    dataRefreshInProgressRef.current = true;
    
    try {
      const roles = await fetchUserRoles(user.id);
      setUserRoles(roles);
      
      await new Promise(resolve => setTimeout(resolve, 100));
      await fetchUserBalance(user.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Không thể cập nhật thông tin người dùng');
    } finally {
      dataRefreshInProgressRef.current = false;
    }
  }, [user?.id, fetchUserRoles, fetchUserBalance, setUserRoles]);

  // Handle auth state changes with improved error handling and debouncing
  const handleAuthStateChange = useCallback(async (event: string, currentSession: any) => {
    console.debug('Auth state change event:', event);
    
    // CRITICAL FIX: Always update session state immediately
    setSession(currentSession);
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (currentSession?.user) {
        console.log('User signed in or token refreshed:', currentSession.user.email);
        
        // Update user state immediately to improve perceived performance
        setUser(currentSession.user as User);
        setLoading(false);
        
        if (event === 'SIGNED_IN' || !authInitialized) {
          const start = performance.now();
          setUserRoles([]); // Clear roles while loading new ones
          
          // Use setTimeout to avoid blocking the UI and prevent race conditions
          setTimeout(async () => {
            try {
              const roles = await fetchUserRoles(currentSession.user.id);
              setUserRoles(roles);
              console.log(`Roles loaded in ${(performance.now() - start).toFixed(1)}ms:`, roles);
              
              await fetchUserBalance(currentSession.user.id);
              console.log(`Balance loaded in ${(performance.now() - start).toFixed(1)}ms:`, userBalance);
            } catch (err) {
              console.error('Error loading user data:', err);
              setUserRoles([]);
              setUserBalance(0);
            }
          }, 0);
        }
      }
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      setUser(null);
      setUserRoles([]);
      setUserBalance(0);
      setSession(null);
      setLoading(false);
      
      if (user?.id) {
        localStorage.removeItem(`user_roles_${user.id}`);
        localStorage.removeItem(`user_balance_${user.id}`);
      }
    } else if (event === 'INITIAL_SESSION') {
      if (currentSession) {
        setUser(currentSession.user as User);
      }
      
      const delay = Date.now() - initializationTimeRef.current;
      console.log(`Initial session check completed in ${delay}ms`, 
                 currentSession ? 'with session' : 'without session');
      
      // CRITICAL FIX: Always set loading to false after initial session check
      setLoading(false);
    }
    
    // Load additional data without blocking UI when session changes significantly
    if (authInitialized && 
        event !== 'INITIAL_SESSION' && 
        currentSession?.user?.id !== user?.id) {
      if (currentSession?.user) {
        setTimeout(async () => {
          try {
            const roles = await fetchUserRoles(currentSession.user.id);
            setUserRoles(roles);
            
            await fetchUserBalance(currentSession.user.id);
          } catch (err) {
            console.error('Error refreshing user data after session change:', err);
          }
        }, 0);
      }
    }
  }, [authInitialized, fetchUserBalance, fetchUserRoles, user?.id, setUserRoles, userBalance]);

  // Initialize auth state with better error handling and timeouts
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        console.log('🚀 Starting auth initialization...');
        setLoading(true);
        initializationTimeRef.current = Date.now();
        
        // CRITICAL FIX: Register auth state change listener first
        authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
        console.log('Auth listener registered');
        
        // CRITICAL FIX: Then check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching initial session:', error);
          setAuthError(error);
          if (isMounted) setLoading(false);
        } else {
          console.log('Initial session check:', data.session ? '✅ Session found' : '❌ No session');
          
          if (isMounted) {
            if (data.session) {
              setUser(data.session.user as User);
              setSession(data.session);
            }
            
            // Important: Set loading to false as soon as we know if a session exists or not
            setLoading(false);
          }
          
          // Load additional data in background without blocking UI
          if (data.session?.user) {
            setTimeout(async () => {
              try {
                if (!isMounted) return;
                
                const roles = await fetchUserRoles(data.session.user.id);
                if (isMounted) setUserRoles(roles);
                
                if (!isMounted) return;
                await fetchUserBalance(data.session.user.id);
              } catch (err) {
                console.error('Error loading additional user data:', err);
              }
            }, 0);
          }
        }
        
        if (isMounted) {
          setAuthInitialized(true);
          console.log('🏁 Auth initialization completed');
        }
      } catch (error: any) {
        console.error('Error in auth initialization:', error);
        if (isMounted) {
          setAuthError(error);
          setLoading(false);
        }
        
        toast.error('Lỗi khởi tạo xác thực');
      }
      
      // CRITICAL FIX: Failsafe timer to prevent indefinite loading
      const failsafeTimer = setTimeout(() => {
        if (isMounted && loading) {
          console.warn('❗ Auth initialization taking too long, clearing loading state as a failsafe');
          setLoading(false);
        }
      }, 3000); // 3 seconds maximum wait time
      
      return () => clearTimeout(failsafeTimer);
    };
    
    initAuth();
    
    return () => {
      isMounted = false;
      if (authListenerRef.current) {
        console.log('Cleaning up auth listener');
        authListenerRef.current.data.subscription.unsubscribe();
        authListenerRef.current = null;
      }
    };
  }, [handleAuthStateChange, fetchUserRoles, fetchUserBalance, loading]);

  // Manual session refresh function
  const refreshSession = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.error('Error refreshing session:', error);
        return false;
      }
      
      setSession(data.session);
      if (data.session?.user) {
        setUser(data.session.user as User);
      }
      
      return !!data.session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  }, []);

  return {
    user,
    session,
    loading,
    isAdmin,
    isStaff,
    isAuthenticated,
    userRoles,
    userBalance,
    setUserBalance,
    fetchUserBalance,
    refreshUserData,
    refreshSession,
    isLoadingBalance,
    authError,
    authInitialized,
    // Expose these setters for direct manipulation from AuthContext
    setUser,
    setSession,
    setLoading
  };
};
