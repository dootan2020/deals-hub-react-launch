
import { createContext, useContext, ReactNode, useEffect } from 'react';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useAuthActions } from '@/hooks/auth/useAuthActions';
import type { AuthState } from '@/hooks/auth/auth-types';
import type { AuthActions } from '@/hooks/auth/auth-types';
import { authMonitoring } from '@/utils/auth/auth-monitoring';

type AuthContextType = AuthState & AuthActions & {
  setUserBalance: (balance: number) => void;
  debugMode?: boolean;
  toggleDebugMode?: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const state = useAuthState();
  const actions = useAuthActions();

  // Log important auth events
  useEffect(() => {
    if (state.loading) {
      authMonitoring.logEvent({ type: 'session_check' });
      authMonitoring.incrementSessionChecks();
    }
  }, [state.loading]);

  useEffect(() => {
    if (state.authError) {
      authMonitoring.notifyAuthIssue(
        'Authentication Error',
        state.authError.message
      );
    }
  }, [state.authError]);

  return (
    <AuthContext.Provider 
      value={{ 
        ...state, 
        ...actions,
        toggleDebugMode: () => authMonitoring.setDebugMode(!process.env.NODE_ENV === 'development')
      }}
    >
      {!state.loading && children}
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
