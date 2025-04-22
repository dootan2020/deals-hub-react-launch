
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth.types';
import { useUserDataFetch } from './use-user-data-fetch';
import { useSessionMonitoring } from './use-session-monitoring';
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
    setSession(currentSession);
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      if (currentSession?.user) {
        console.log('User signed in or token refreshed:', currentSession.user.email);
        setUser(currentSession.user as unknown as User);
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
        setUser(currentSession.user as unknown as User);
      }
      
      const delay = Date.now() - initializationTimeRef.current;
      console.log(`Initial session check completed in ${delay}ms`, 
                 currentSession ? 'with session' : 'without session');
      setLoading(false);
    }
    
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
  }, [authInitialized, fetchUserBalance, fetchUserRoles, user?.id, setUserRoles]);

  // Initial auth state check
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        setLoading(true);
        initializationTimeRef.current = Date.now();
        
        authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
        console.log('Auth listener registered at', new Date().toISOString());
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching initial session:', error);
          setAuthError(error);
          if (isMounted) setLoading(false);
        } else {
          console.log('Initial session check:', data.session ? 'Session found' : 'No session');
          
          if (isMounted) {
            setUser(data.session?.user as unknown as User || null);
            setSession(data.session);
          }
          
          if (data.session?.user) {
            if (isMounted) setLoading(false);
            
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
          } else {
            if (isMounted) setLoading(false);
          }
        }
        
        if (isMounted) setAuthInitialized(true);
      } catch (error: any) {
        console.error('Error in auth initialization:', error);
        if (isMounted) {
          setAuthError(error);
          setLoading(false);
        }
        
        toast.error('Lỗi khởi tạo xác thực');
      }
      
      const failsafeTimer = setTimeout(() => {
        if (isMounted && loading) {
          console.warn('Auth initialization taking too long, clearing loading state as a failsafe');
          setLoading(false);
        }
      }, 2000);
      
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
