import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { useBalanceListener } from '@/hooks/use-balance-listener';
import { AuthContextType } from '@/types/auth.types';
import { toast } from 'sonner';
import { useSessionTimeout } from '@/hooks/auth/use-session-timeout';
import { useSessionMonitor } from '@/hooks/auth/use-session-monitor';
import { useSessionRefresh } from '@/hooks/auth/use-session-refresh';

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

  useSessionTimeout(!!user, user?.id, session?.access_token, logout);
  useSessionMonitor(session, logout);
  useSessionRefresh(session);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);
      toast.error('Lỗi xác thực', { description: authError.message });
    }
  }, [authError]);

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
