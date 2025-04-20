
import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthActions } from '@/hooks/use-auth-actions';
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
  login: async () => {},
  logout: async () => {},
  register: async () => {},
  checkUserRole: () => false,
  isEmailVerified: false,
  resendVerificationEmail: async () => false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
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

  // Log authentication errors
  React.useEffect(() => {
    if (authError) {
      console.error('Authentication error:', authError);
      toast.error('Lỗi xác thực', authError.message);
    }
  }, [authError]);

  // Set up real-time balance updates
  useBalanceListener(user?.id, (newBalance) => {
    if (typeof newBalance === 'number') {
      console.log('Balance updated via listener:', newBalance);
      setUserBalance(newBalance);
    }
  });

  // Function to refresh user balance
  const refreshUserBalance = useCallback(async () => {
    if (!user?.id) return;
    console.log('Manually refreshing user balance for ID:', user.id);
    
    try {
      await fetchUserBalance(user.id);
      return userBalance; // Return current balance after refresh
    } catch (error) {
      console.error('Error refreshing balance:', error);
      toast.error('Không thể cập nhật số dư', 'Vui lòng thử lại sau');
      throw error;
    }
  }, [user?.id, fetchUserBalance, userBalance]);

  // Function to refresh the entire user profile
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

  // Helper function to check if user has a specific role
  const checkUserRole = useCallback((role: typeof userRoles[number]): boolean => {
    return userRoles.includes(role);
  }, [userRoles]);

  // Check if email is verified
  const isEmailVerified = user?.email_confirmed_at !== null;

  // Memoize the context value to prevent unnecessary re-renders
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
    login,
    logout,
    register,
    checkUserRole,
    isEmailVerified,
    resendVerificationEmail,
  }), [
    user, session, loading, isAdmin, isStaff, userRoles, userBalance,
    isLoadingBalance, refreshUserBalance, refreshUserProfile, login, 
    logout, register, checkUserRole, isEmailVerified, resendVerificationEmail
  ]);

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
