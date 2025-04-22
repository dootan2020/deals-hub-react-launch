
import { createContext, useContext, useMemo, ReactNode, memo } from 'react';
import { useSessionState } from '@/hooks/auth/use-session-state';
import { useSessionEvents } from '@/hooks/auth/use-session-events';
import { useAuthRefresh } from '@/hooks/auth/use-auth-refresh';
import { useAuthErrors } from '@/hooks/auth/use-auth-errors';
import { useAsyncEffect } from '@/utils/asyncUtils';
import { useAuthTokens } from '@/hooks/auth/useAuthTokens';
import { useUserProfile } from '@/hooks/auth/useUserProfile';
import { useSessionMonitoring } from '@/hooks/auth/useSessionMonitoring';
import { useAuthActions } from '@/hooks/auth/useAuthActions';
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
  const { tokens, setTokens, refreshToken, clearTokens } = useAuthTokens();
  const { profile, loading: profileLoading, error: profileError, clearProfile } = useUserProfile();
  const { isOnline } = useSessionMonitoring(
    () => console.log('Offline detected'),
    () => console.log('Back online, refreshing session')
  );

  const {
    login,
    logout,
    register,
    refreshSession,
    refreshUserProfile,
    refreshUserBalance
  } = useAuthActions();

  // Memoized auth state values
  const authStateValue = useMemo(() => ({
    loading: profileLoading,
    error: profileError,
    isAuthenticated: !!tokens.access && !!profile,
    isAdmin: profile?.roles?.includes('admin') ?? false,
    isStaff: profile?.roles?.includes('staff') ?? false,
    tokens,
    isOnline,
    login,
    logout: async () => {
      await logout();
      clearTokens();
      clearProfile();
    },
    register,
    refreshSession,
    refreshUserProfile,
    refreshUserBalance,
    updateProfile: refreshUserProfile
  }), [
    profileLoading,
    profileError,
    tokens,
    profile,
    isOnline,
    login,
    logout,
    register,
    refreshSession,
    refreshUserProfile,
    refreshUserBalance,
    clearTokens,
    clearProfile
  ]);

  // Don't render anything while initializing auth
  if (profileLoading && !profile) return null;

  return (
    <AuthErrorBoundary>
      <AuthStateContext.Provider value={authStateValue}>
        <UserProvider user={profile}>
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

export const useAuthState = () => {
  const context = useContext(AuthStateContext);
  if (context === undefined) {
    throw new Error('useAuthState must be used within AuthProvider');
  }
  return context;
};

// Combined hook for backward compatibility
export const useAuth = () => {
  const user = useUser();
  const authState = useAuthState();
  return useMemo(() => ({ 
    user, 
    ...authState 
  }), [user, authState]);
};
