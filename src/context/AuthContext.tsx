
import React, { createContext, useContext, useCallback } from 'react';
import { useAuthState } from '@/hooks/use-auth-state';
import { useAuthActions } from '@/hooks/use-auth-actions';
import { useBalanceListener } from '@/hooks/use-balance-listener';
import { AuthContextType } from '@/types/auth.types';

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
    isLoadingBalance
  } = useAuthState();

  const { login, logout, register } = useAuthActions();

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
    await fetchUserBalance(user.id);
    return userBalance; // Return current balance after refresh
  }, [user?.id, fetchUserBalance, userBalance]);

  // Function to refresh the entire user profile
  const refreshUserProfile = useCallback(async () => {
    if (!user?.id) return;
    console.log('Refreshing full user profile for ID:', user.id);
    await refreshUserData();
  }, [user?.id, refreshUserData]);

  // Helper function to check if user has a specific role
  const checkUserRole = useCallback((role: typeof userRoles[number]): boolean => {
    return userRoles.includes(role);
  }, [userRoles]);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue: AuthContextType = {
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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
