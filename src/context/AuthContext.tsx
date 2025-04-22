
import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { useBalanceListener } from '@/hooks/use-balance-listener';
import { AuthContextType } from '@/types/auth.types';
import { toast } from '@/hooks/use-toast';
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
  register: async () => {},
  checkUserRole: () => false,
  isEmailVerified: false,
  resendVerificationEmail: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [hydrated, setHydrated] = useState(false);
  const [sessionRefreshAttempt, setSessionRefreshAttempt] = useState(0);
  
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

  const { login, logout, register, resendVerificationEmail } = useAuthActions();

  const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tokenRefreshRef = useRef<NodeJS.Timeout | null>(null);

  // Handle hydration
  useEffect(() => {
    setHydrated(true);
    console.log('AuthContext hydrated');
    return () => console.log('AuthContext unmounted');
  }, []);

  // Error handling
  useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);
      toast.error('Lỗi xác thực', authError.message);
      
      // On authentication error, attempt to refresh the session once
      if (sessionRefreshAttempt === 0) {
        console.log('Attempting to refresh session due to auth error');
        setSessionRefreshAttempt(prev => prev + 1);
        
        // Try to refresh token
        supabase.auth.refreshSession().then(({ data, error }) => {
          if (error) {
            console.error('Session refresh failed:', error);
          } else if (data.session) {
            console.log('Session refreshed successfully');
          }
        });
      }
    }
  }, [authError, sessionRefreshAttempt]);

  // Session expiry monitoring and auto-refresh
  useEffect(() => {
    if (!session) return;
    
    // Clear any existing refresh timer
    if (tokenRefreshRef.current) {
      clearTimeout(tokenRefreshRef.current);
      tokenRefreshRef.current = null;
    }
    
    if (session.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at;
      const timeUntilExpiry = expiresAt - now;
      
      console.log(`Session expires in ${timeUntilExpiry} seconds`);
      
      // If session is valid but will expire in less than 5 minutes, refresh it
      if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
        console.log('Session expiring soon, scheduling refresh');
        tokenRefreshRef.current = setTimeout(() => {
          console.log('Refreshing session token');
          supabase.auth.refreshSession().then(({ data, error }) => {
            if (error) {
              console.error('Failed to refresh session:', error);
            } else {
              console.log('Session refreshed successfully');
            }
          });
        }, 0);
      }
      
      // If session is expired, notify and attempt refresh immediately
      if (expiresAt < now) {
        console.warn('Session expired!');
        
        // Try to refresh session immediately
        supabase.auth.refreshSession().then(({ data, error }) => {
          if (error) {
            console.error('Failed to refresh expired session:', error);
            logout().catch(err => {
              console.error('Error during logout after session expiry:', err);
            });
          } else if (data.session) {
            console.log('Expired session refreshed successfully');
            // Force a refresh of user data
            refreshUserData();
          }
        });
      }
    }
  }, [session, logout, refreshUserData]);

  // Session activity timeout
  useEffect(() => {
    if (user && session) {
      if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = setTimeout(() => {
        console.warn('Session timeout reached, logging out user for security.');
        logout().finally(() => {
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

  // Balance listener integration
  useBalanceListener(user?.id, (newBalance) => {
    if (typeof newBalance === 'number') {
      console.log('Balance updated via listener:', newBalance);
      setUserBalance(newBalance);
    }
  });

  // Balance refresh functionality
  const refreshUserBalance = useCallback(async () => {
    if (!user?.id) return;
    console.log('Manually refreshing user balance for ID:', user.id);

    try {
      await fetchUserBalance(user.id);
      return userBalance;
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Không thể cập nhật số dư', 'Vui lòng thử lại sau');
      throw error;
    }
  }, [user?.id, fetchUserBalance, userBalance]);

  const refreshBalance = refreshUserBalance;

  // Profile refresh functionality
  const refreshUserProfile = useCallback(async () => {
    if (!user?.id) return;
    console.log('Refreshing full user profile for ID:', user.id);

    try {
      await refreshUserData();
    } catch (error) {
      console.error('Error refreshing user profile:', error);
      toast.error('Không thể cập nhật thông tin người dùng', 'Vui lòng thử lại sau');
      throw error;
    }
  }, [user?.id, refreshUserData]);

  const checkUserRole = useCallback((role: typeof userRoles[number]): boolean => {
    return userRoles.includes(role);
  }, [userRoles]);

  const isEmailVerified = user?.email_confirmed_at !== null;

  const contextValue: AuthContextType = useMemo(() => ({
    user,
    session,
    loading,
    isAuthenticated: !!user && !!session,
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
    isLoadingBalance, refreshUserBalance, refreshUserProfile, refreshBalance, login, 
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
