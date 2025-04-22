import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSessionManagement } from './use-session-management';
import { useUserData } from './use-user-data';
import { useDataRefresh } from './use-data-refresh';
import { toast } from 'sonner';

export const useAuthState = () => {
  const {
    user,
    session,
    loading,
    authError,
    authInitialized,
    handleAuthStateChange,
    authListenerRef,
    initializationTimeRef,
    setAuthInitialized,
    setLoading
  } = useSessionManagement();

  const {
    userRoles,
    setUserRoles,
    userBalance,
    setUserBalance,
    isLoadingBalance,
    fetchUserRoles,
    fetchUserBalance
  } = useUserData();

  const { refreshUserData } = useDataRefresh(user?.id, fetchUserRoles, fetchUserBalance);

  const isAdmin = userRoles.includes('admin');
  const isStaff = userRoles.includes('staff');

  // Initial auth state check
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        setLoading(true);
        authListenerRef.current = supabase.auth.onAuthStateChange(handleAuthStateChange);
        
        console.log('Auth listener registered at', new Date().toISOString());
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching initial session:', error);
          if (isMounted) setLoading(false);
        } else {
          if (data.session?.user && isMounted) {
            const loadAdditionalData = async () => {
              try {
                const roles = await fetchUserRoles(data.session!.user.id);
                if (isMounted) setUserRoles(roles);
                await new Promise(resolve => setTimeout(resolve, 300));
                await fetchUserBalance(data.session!.user.id);
              } catch (err) {
                console.error('Error loading additional user data:', err);
              }
            };
            
            loadAdditionalData();
          }
          
          if (isMounted) setLoading(false);
        }
        
        if (isMounted) setAuthInitialized(true);
      } catch (error: any) {
        console.error('Error in auth initialization:', error);
        if (isMounted) {
          setLoading(false);
        }
        
        toast.error('Lỗi khởi tạo xác thực', {
          description: 'Không thể khởi tạo phiên đăng nhập. Vui lòng tải lại trang.'
        });
      }
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
  }, [handleAuthStateChange, fetchUserRoles, fetchUserBalance]);

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
