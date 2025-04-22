
import { createContext, useContext, useMemo, ReactNode, memo } from 'react';
import { useSessionState } from '@/hooks/auth/use-session-state';
import { useSessionEvents } from '@/hooks/auth/use-session-events';
import { useAuthRefresh } from '@/hooks/auth/use-auth-refresh';
import { useAuthRetry } from '@/hooks/auth/use-auth-retry';
import { useAuthErrors } from '@/hooks/auth/use-auth-errors';
import { useAsyncEffect } from '@/utils/asyncUtils';
import type { AuthContextType, User } from '@/types/auth.types';

// Separate contexts for different types of data
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
    authInitialized,
    updateSession,
    initializeAuth,
    setLoading
  } = useSessionState();

  const { handleAuthError, clearError } = useAuthErrors();
  
  const { attemptRefresh, refreshing } = useAuthRefresh({
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 16000
  });
  
  const {
    attempts,
    showRetry,
    scheduleRetry,
    cleanup: cleanupRetry
  } = useAuthRetry({
    maxAttempts: 3,
    baseDelay: 2000,
    maxDelay: 16000
  });

  useAsyncEffect(async () => {
    const unsubscribe = await useSessionEvents(updateSession, initializeAuth);
    return () => {
      unsubscribe?.();
      cleanupRetry();
    };
  }, []);

  // Memoize auth state values that change together
  const authStateValue = useMemo(() => ({
    session,
    loading,
    authInitialized,
    refreshing,
    showRetry,
    attemptRefresh: async () => {
      try {
        const success = await attemptRefresh();
        if (!success) {
          scheduleRetry(attemptRefresh);
        }
        return success;
      } catch (error) {
        handleAuthError(error);
        return false;
      }
    },
    retryAuth: () => {
      clearError();
      cleanupRetry();
      return attemptRefresh();
    }
  }), [session, loading, authInitialized, refreshing, showRetry, attemptRefresh, 
       scheduleRetry, handleAuthError, clearError, cleanupRetry]);

  // Only render when not loading
  if (loading) return null;

  return (
    <AuthStateContext.Provider value={authStateValue}>
      <UserProvider user={user}>
        {children}
      </UserProvider>
    </AuthStateContext.Provider>
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
