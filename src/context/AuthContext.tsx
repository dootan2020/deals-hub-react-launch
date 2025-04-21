import React, { createContext, useContext, useCallback, useMemo, useState, useEffect, useRef } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { useBalanceListener } from '@/hooks/use-balance-listener';
import { AuthContextType } from '@/types/auth.types';
import { toast } from '@/hooks/use-toast';

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

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);
      toast.error('Lỗi xác thực', authError.message);
    }
  }, [authError]);

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
  }, [user?.id, session?.access_token]);

  useEffect(() => {
    if (session && session.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      if (session.expires_at < now) {
        console.error('Session expired! Forcing logout.');
        logout().finally(() => {
          window.location.replace('/login?expired=1');
        });
      }
    }
  }, [session]);

  useBalanceListener(user?.id, (newBalance) => {
    if (typeof newBalance === 'number') {
      console.log('Balance updated via listener:', newBalance);
      setUserBalance(newBalance);
    }
  });

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
