
import { User, Session } from '@supabase/supabase-js';
import { UserRole } from '@/types/auth.types';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  authError: Error | null;
  isAdmin: boolean;
  isStaff: boolean;
  userRoles: UserRole[];
  userBalance: number;
  isLoadingBalance: boolean;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
  refreshUserBalance: () => Promise<number>;
}
