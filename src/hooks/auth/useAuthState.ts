
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth.types';
import { useUserDataFetch } from './useUserDataFetch';
import { useSessionMonitoring } from './useSessionMonitoring';
import { toast } from 'sonner';

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

  // Refresh user data (roles, balance, etc)
  const refreshUserData = useCallback(async () => {
    if (!user?.id || dataRefreshInProgressRef.current) return;
    
    console.debug('Refreshing user data');
    dataRefreshInProgressRef.current = true;
    
    try {
      const roles = await fetchUserRoles(user.id);
      setUserRoles(roles);
      
      await new Promise(resolve => setTimeout(resolve, 300));
      await fetchUserBalance(user.id);
    } catch (error) {
      console.error('Error refreshing user data:', error);
      toast.error('Không thể cập nhật thông tin người dùng');
    } finally {
      dataRefreshInProgressRef.current = false;
    }
  }, [user?.id, fetchUserRoles, fetchUserBalance, setUserRoles]);

  // Handle auth state changes
  const handleAuthStateChange = useCallback(async (event: string, currentSession: any) => {
    console.debug('Auth state change event:', event);
    
    // CRITICAL FIX: Always update session state immediately
    setSession(currentSession);
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (currentSession?.user) {
        console.log('User signed in or token refreshed:', currentSession.user.email);
        
        // CRITICAL FIX: Convert Supabase User to App User format
        const supabaseUser = currentSession.user;
        const appUser = {
          ...supabaseUser,
          email: supabaseUser.email || null,
        } as User;
        
        console.debug('Setting user from auth state change', appUser.id);
        setUser(appUser);
        setLoading(false);
        
        if (event === 'SIGNED_IN' || !authInitialized) {
          const start = performance.now();
          setUserRoles([]);
          
          const loadUserData = async () => {
            try {
              const roles = await fetchUserRoles(currentSession.user.id);
              setUserRoles(roles);
              console.log(`Roles loaded in ${(performance.now() - start).toFixed(1)}ms:`, roles);
              
              await new Promise(resolve => setTimeout(resolve, 300));
              const balance = await fetchUserBalance(currentSession.user.id);
              console.log(`Balance loaded in ${(performance.now() - start).toFixed(1)}ms:`, balance);
            } catch (err) {
              console.error('Error loading user data:', err);
              setUserRoles([]);
              setUserBalance(0);
            }
          };
          
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
      
      if (user?.id) {
        localStorage.removeItem(`user_roles_${user.id}`);
        localStorage.removeItem(`user_balance_${user.id}`);
      }
    } else if (event === 'INITIAL_SESSION') {
      if (currentSession) {
        // CRITICAL FIX: Convert Supabase User to App User format
        const supabaseUser = currentSession.user;
        const appUser = {
          ...supabaseUser,
          email: supabaseUser.email || null,
        } as User;
        
        console.debug('Setting user from INITIAL_SESSION', appUser.id);
        setUser(appUser);
      }
      
      const delay = Date.now() - initializationTimeRef.current;
      console.log(`Initial session check completed in ${delay}ms`, 
                 currentSession ? 'with session' : 'without session');
      setLoading(false);
    }
    
    // Only load additional data if session changed
    if (authInitialized && 
        event !== 'INITIAL_SESSION' && 
        currentSession?.user?.id !== user?.id) {
      if (currentSession?.user) {
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
  }, [authInitialized, fetchUserBalance, fetchUserRoles, user?.id, setUserRoles, setUserBalance]);

  // Initial auth state check
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        console.log('🚀 Starting auth initialization...');
        setLoading(true);
        initializationTimeRef.current = Date.now();
        
        // CRITICAL FIX: Register auth state change listener first
        authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
        console.log('Auth listener registered at', new Date().toISOString());
        
        // CRITICAL FIX: Then check for existing session and manually update state
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching initial session:', error);
          setAuthError(error);
          if (isMounted) setLoading(false);
        } else {
          console.log('Initial session check:', data.session ? '✅ Session found' : '❌ No session');
          
          if (isMounted) {
            if (data.session) {
              // CRITICAL FIX: Convert Supabase User to App User format
              const supabaseUser = data.session.user;
              const appUser = {
                ...supabaseUser,
                email: supabaseUser.email || null,
              } as User;
              
              console.debug('Setting user from initAuth', appUser.id);
              setUser(appUser);
              setSession(data.session);
            }
            
            // Important: Set loading to false as soon as we know if a session exists or not
            setLoading(false);
          }
          
          if (data.session?.user) {
            // Load additional data in background without blocking UI
            const loadAdditionalData = async () => {
              try {
                const roles = await fetchUserRoles(data.session.user.id);
                if (isMounted) setUserRoles(roles);
                
                await new Promise(resolve => setTimeout(resolve, 300));
                await fetchUserBalance(data.session.user.id);
              } catch (err) {
                console.error('Error loading additional user data:', err);
              }
            };
            
            loadAdditionalData();
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
      
      // CRITICAL FIX: Reduced failsafe timer from 1.5s to 1s
      const failsafeTimer = setTimeout(() => {
        if (isMounted && loading) {
          console.warn('❗ Auth initialization taking too long, clearing loading state as a failsafe');
          setLoading(false);
        }
      }, 1000);
      
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
  }, [handleAuthStateChange, fetchUserRoles, fetchUserBalance, loading, setUserRoles]);

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
    authError,
    // Expose these setters for direct manipulation from AuthContext
    setUser,
    setSession
  };
};
