
import { createContext, useContext, useMemo, ReactNode, memo } from 'react';
import { useAuthState as useAuthStateHook } from '@/hooks/auth/useAuthState';
import type { AuthContextType, User } from '@/types/auth.types';
import { AuthErrorBoundary } from '@/components/auth/AuthErrorBoundary';

// Separate contexts for different types of data to prevent unnecessary rerenders
const UserContext = createContext<User | null>(null);
const AuthStateContext = createContext<Omit<AuthContextType, 'user'> | null>(null);

// Memoized providers
const UserProvider = memo(({ children, user }: { children: ReactNode; user: User | null }) => (
  <UserContext.Provider value={user}>{children}</UserContext.Provider>
));

UserProvider.displayName = 'UserProvider';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const {
    user,
    session,
    loading,
    error,
    isAdmin,
    isStaff,
    userRoles,
    userBalance,
    setUserBalance,
    fetchUserBalance,
    refreshUserData,
    isLoadingBalance,
  } = useAuthStateHook();

  // Memoized auth state values
  const authStateValue = useMemo(() => ({
    loading,
    error,
    isAuthenticated: !!session && !!user,
    isAdmin,
    isStaff,
    session,
    isOnline: true, // Delegate online status monitoring to useSessionMonitoring
    login: async (email: string, password: string) => {
      // Login logic moved to useAuthActions
    },
    logout: async () => {
      // Logout logic moved to useAuthActions
    },
    register: async (email: string, password: string) => {
      // Register logic moved to useAuthActions
    },
    refreshSession: async () => {
      // Session refresh logic moved to useAuthRefresh
      return true;
    },
    refreshUserProfile: async () => {
      await refreshUserData();
    },
    refreshUserBalance: async () => {
      return await fetchUserBalance(user?.id || '');
    },
    updateProfile: async () => {
      await refreshUserData();
    }
  }), [
    loading, 
    error, 
    session, 
    user, 
    isAdmin, 
    isStaff, 
    refreshUserData, 
    fetchUserBalance
  ]);

  // Don't render anything while initializing auth
  if (loading && !user) return null;

  return (
    <AuthErrorBoundary>
      <AuthStateContext.Provider value={authStateValue}>
        <UserProvider user={user}>
          {children}
        </UserProvider>
      </AuthStateContext.Provider>
    </AuthErrorBoundary>
  );
};

// Custom hooks for accessing context values
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within UserProvider');
  }
  return context;
};

export const useAuthContext = () => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return context;
};

// Combined hook for backward compatibility
export const useAuth = () => {
  const user = useUser();
  const authState = useAuthContext();
  return useMemo(() => ({ 
    user, 
    ...authState 
  }), [user, authState]);
};
