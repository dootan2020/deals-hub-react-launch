import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { useBalanceListener } from '@/hooks/use-balance-listener';
import { AuthContextType, UserRole } from '@/types/auth.types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  isAdmin: false,
  isStaff: false,
  userRoles: [],
  userBalance: 0,
  refreshUserBalance: async () => {},
  refreshUserProfile: async () => {},
  refreshBalance: async () => {},
  login: async () => {},
  logout: async () => {},
  register: async () => ({}),
  checkUserRole: () => false,
  isEmailVerified: false,
  resendVerificationEmail: async () => false,
  isLoadingBalance: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hydrated, setHydrated] = useState(false);
  const [lastSessionCheck, setLastSessionCheck] = useState(0);
  
  const {
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
  } = useAuthState();

  const { login: authLogin, logout, register, resendVerificationEmail } = useAuthActions();

  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (session?.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
      
      if (timeUntilExpiry < 300) {
        console.log("Session expires soon, refreshing now...");
        supabase.auth.refreshSession();
      }
      else if (timeUntilExpiry > 360) {
        const refreshDelay = (timeUntilExpiry - 300) * 1000;
        console.log(`Scheduling session refresh in ${Math.floor(refreshDelay/60000)} minutes`);
        
        refreshTimeoutRef.current = setTimeout(() => {
          console.log("Executing scheduled session refresh");
          supabase.auth.refreshSession()
            .then(({ data, error }) => {
              if (error) {
                console.error("Failed to refresh session:", error);
              } else if (data.session) {
                console.log("Session refreshed successfully, new expiry:", 
                  new Date(data.session.expires_at * 1000).toLocaleString());
              }
            });
        }, refreshDelay);
      }
    }
    
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, [session?.expires_at]);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    const checkSessionInterval = setInterval(() => {
      const now = Date.now();
      if (now - lastSessionCheck > 2 * 60 * 1000) {
        setLastSessionCheck(now);
        if (session?.expires_at) {
          const currentTime = Math.floor(Date.now() / 1000);
          if (session.expires_at < currentTime) {
            console.log('Session has expired during app usage, logging out');
            logout().then(() => {
              toast.error('Phiên đăng nhập hết hạn', {
                description: 'Vui lòng đăng nhập lại để tiếp tục',
              });
              setTimeout(() => {
                window.location.replace('/login?expired=1');
              }, 1000);
            });
          }
        }
      }
    }, 30000);
    
    return () => clearInterval(checkSessionInterval);
  }, [session, logout, lastSessionCheck]);

  useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);
      toast.error('Lỗi xác thực', { description: authError.message });
    }
  }, [authError]);

  useEffect(() => {
    if (user && session) {
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
      
      sessionTimeoutRef.current = setTimeout(() => {
        console.warn('Session timeout reached, logging out user for security.');
        logout().finally(() => {
          toast.warning('Phiên làm việc hết hạn do không hoạt động', {
            description: 'Vui lòng đăng nhập lại để tiếp tục'
          });
          window.location.replace('/login?timeout=1');
        });
      }, 3 * 60 * 60 * 1000);
    } else {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    }
    
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = null;
      }
    };
  }, [user?.id, session?.access_token, logout]);

  useEffect(() => {
    const resetTimeout = () => {
      if (user && session && sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
        sessionTimeoutRef.current = setTimeout(() => {
          console.warn('Session timeout reached, logging out user for security.');
          logout().finally(() => {
            window.location.replace('/login?timeout=1');
          });
        }, 3 * 60 * 60 * 1000);
      }
    };

    window.addEventListener('click', resetTimeout);
    window.addEventListener('keypress', resetTimeout);
    window.addEventListener('scroll', resetTimeout);
    window.addEventListener('mousemove', resetTimeout);

    return () => {
      window.removeEventListener('click', resetTimeout);
      window.removeEventListener('keypress', resetTimeout);
      window.removeEventListener('scroll', resetTimeout);
      window.removeEventListener('mousemove', resetTimeout);
    };
  }, [user, session, logout]);

  useBalanceListener(user?.id, (newBalance) => {
    if (typeof newBalance === 'number') {
      console.log('Balance updated via listener:', newBalance);
      setUserBalance(newBalance);
    }
  });

  const refreshUserBalance = useCallback(async (): Promise<void> => {
    if (!user?.id) return;
    console.log('Manually refreshing user balance for ID:', user.id);

    try {
      const balance = await fetchUserBalance(user.id);
      setUserBalance(balance);
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Không thể cập nhật số dư', { description: 'Vui lòng thử lại sau' });
      throw error;
    }
  }, [user?.id, fetchUserBalance, setUserBalance]);

  const refreshBalance = useCallback(async (): Promise<void> => {
    await refreshUserBalance();
  }, [refreshUserBalance]);

  const refreshUserProfile = useCallback(async () => {
    if (!user?.id) return;
    console.log('Refreshing full user profile for ID:', user.id);

    try {
      await refreshUserData();
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      toast.error('Không thể cập nhật hồ sơ người dùng', { description: 'Vui lòng thử lại sau' });
      throw error;
    }
  }, [user?.id, refreshUserData]);

  const login = async (email: string, password: string): Promise<void> => {
    await authLogin(email, password);
  };

  const checkUserRole = useCallback((role: UserRole): boolean => {
    return userRoles.includes(role);
  }, [userRoles]);

  const isEmailVerified = user?.email_confirmed_at !== null;

  const contextValue = useMemo(() => ({
    user,
    session,
    loading,
    isAuthenticated: !!user,
    isAdmin,
    isStaff,
    userRoles,
    userBalance,
    isLoadingBalance,
    refreshUserBalance,
    refreshUserProfile,
    refreshBalance,
    login,
    logout,
    register,
    checkUserRole,
    isEmailVerified,
    resendVerificationEmail,
  }), [
    user, session, loading, isAdmin, isStaff, userRoles, userBalance,
    isLoadingBalance, refreshUserBalance, refreshUserProfile, refreshBalance, 
    logout, register, checkUserRole, isEmailVerified, resendVerificationEmail
  ]);

  if (!hydrated) {
    return null;
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
