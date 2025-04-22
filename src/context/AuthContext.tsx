
import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthActions } from '@/hooks/auth/use-auth-actions';
import { useBalanceListener } from '@/hooks/use-balance-listener';
import { AuthContextType } from '@/types/auth.types';
import { toast } from 'sonner';
import { useSessionTimeout } from '@/hooks/auth/use-session-timeout';
import { useSessionMonitor } from '@/hooks/auth/use-session-monitor';
import { useSessionRefresh } from '@/hooks/auth/use-session-refresh';
import { UserRole } from '@/types/auth.types';
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
  const [manualSessionCheck, setManualSessionCheck] = useState(false);
  
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

  // Explicitly check for existing session on mount
  useEffect(() => {
    const checkSession = async () => {
      setManualSessionCheck(true);
      try {
        console.log('Explicitly checking for existing session...');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error fetching session:', error);
        } else if (data.session) {
          console.log('Existing session found:', { 
            userId: data.session.user.id,
            expiresAt: new Date(data.session.expires_at! * 1000).toLocaleString()
          });
        } else {
          console.log('No existing session found');
        }
      } catch (err) {
        console.error('Exception during session check:', err);
      } finally {
        setManualSessionCheck(false);
        // Set hydrated regardless of result to unblock UI
        setHydrated(true);
      }
    };
    
    checkSession();
  }, []);

  // Handle authentication errors
  useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);
      toast.error('Lỗi xác thực', { description: authError.message });
    }
  }, [authError]);

  // Setup balance listener for real-time updates
  useBalanceListener(user?.id, (newBalance) => {
    if (typeof newBalance === 'number') {
      console.log('Balance updated via listener:', newBalance);
      setUserBalance(newBalance);
    }
  });

  // Refresh user balance on demand
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

  // Alias for refreshUserBalance
  const refreshBalance = useCallback(async (): Promise<void> => {
    await refreshUserBalance();
  }, [refreshUserBalance]);

  // Refresh full user profile
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

  // Login function
  const login = async (email: string, password: string): Promise<void> => {
    await authLogin(email, password);
  };

  // Role check utility
  const checkUserRole = useCallback((role: UserRole): boolean => {
    return userRoles.includes(role);
  }, [userRoles]);

  const isEmailVerified = user?.email_confirmed_at !== null;

  const isAuthenticated = !!user;

  // Memoize context value to prevent unnecessary rerenders
  const contextValue = useMemo(() => ({
    user,
    session,
    loading: loading || manualSessionCheck,
    isAuthenticated,
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
    user, session, loading, manualSessionCheck, isAdmin, isStaff, userRoles, userBalance,
    isLoadingBalance, refreshUserBalance, refreshUserProfile, refreshBalance, 
    logout, register, checkUserRole, isEmailVerified, resendVerificationEmail, isAuthenticated
  ]);

  // Don't render until hydrated to avoid SSR/hydration mismatch
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
