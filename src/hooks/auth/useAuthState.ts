
import { useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/auth.types';
import { useDebouncedCallback } from '@/hooks/use-debounce';
import { toast } from 'sonner';
import { useUserDataFetch } from './use-user-data-fetch';
import { useSessionManagement } from './use-session-management';

export const useAuthState = () => {
  const {
    user,
    session,
    loading,
    authError,
    authInitialized,
    setAuthInitialized,
    handleAuthStateChange,
    authListenerRef,
    initializationTimeRef,
    setLoading,
    setUser,
    setSession
  } = useSessionManagement();

  const {
    userRoles,
    setUserRoles,
    userBalance,
    setUserBalance,
    isLoadingBalance,
    fetchUserRoles,
    fetchUserBalance
  } = useUserDataFetch();

  const dataRefreshInProgressRef = useRef<boolean>(false);

  // Computed properties
  const isAdmin = userRoles.includes('admin');
  const isStaff = userRoles.includes('staff');

  // Refresh user data - debounced to prevent multiple calls
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
        
        // CRITICAL FIX: Then check for existing session
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching initial session:', error);
          if (isMounted) setLoading(false);
        } else {
          console.log('Initial session check:', initialSession ? 'Session found' : 'No session');
          
          if (isMounted) {
            if (initialSession?.user) {
              setUser(initialSession.user as User);
              setSession(initialSession);
            }
            setLoading(false);
          }
          
          if (initialSession?.user) {
            const loadUserData = async () => {
              try {
                const roles = await fetchUserRoles(initialSession.user.id);
                if (isMounted) setUserRoles(roles);
                
                await new Promise(resolve => setTimeout(resolve, 300));
                await fetchUserBalance(initialSession.user.id);
              } catch (err) {
                console.error('Error loading additional user data:', err);
              }
            };
            
            loadUserData();
          }
        }
        
        if (isMounted) {
          setAuthInitialized(true);
          console.log('🏁 Auth initialization completed');
        }
      } catch (error) {
        console.error('Error in auth initialization:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
      
      const failsafeTimer = setTimeout(() => {
        if (isMounted && loading) {
          console.warn('❗ Auth initialization taking too long, clearing loading state');
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
  }, []);

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
