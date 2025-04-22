
import { createContext, useContext, ReactNode } from 'react';
import { useAuthState } from '@/hooks/auth/useAuthState';
import { useAuthActions } from '@/hooks/auth/useAuthActions';
import type { AuthState } from '@/hooks/auth/auth-types';
import type { AuthActions } from '@/hooks/auth/auth-types';

type AuthContextType = AuthState & AuthActions & {
  setUserBalance: (balance: number) => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const state = useAuthState();
  const actions = useAuthActions();

  return (
    <AuthContext.Provider value={{ ...state, ...actions }}>
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
