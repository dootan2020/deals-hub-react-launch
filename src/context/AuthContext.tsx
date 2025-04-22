
import { createContext, useContext, ReactNode } from 'react';
import { useSessionState } from '@/hooks/auth/use-session-state';
import { useSessionEvents } from '@/hooks/auth/use-session-events';
import { useAuthRefresh } from '@/hooks/auth/use-auth-refresh';
import { useAuthRetry } from '@/hooks/auth/use-auth-retry';
import { useAuthErrors } from '@/hooks/auth/use-auth-errors';
import type { AuthContextType } from '@/types/auth.types';

const AuthContext = createContext<AuthContextType | null>(null);

const RETRY_CONFIG = {
  maxAttempts: 3,
  baseDelay: 2000,
  maxDelay: 16000
};

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
  
  const { attemptRefresh, refreshing } = useAuthRefresh(RETRY_CONFIG);
  
  const {
    attempts,
    showRetry,
    scheduleRetry,
    cleanup: cleanupRetry
  } = useAuthRetry(RETRY_CONFIG);

  useSessionEvents(updateSession, initializeAuth);

  const contextValue: AuthContextType = {
    user,
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
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
