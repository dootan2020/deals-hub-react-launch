
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'staff' | 'user' | 'guest';

export interface AuthUser extends User {
  role?: UserRole;
}

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  userRoles: UserRole[];
  userBalance: number;
  isLoadingBalance?: boolean;
  refreshUserBalance: () => Promise<number | void>;
  refreshBalance: () => Promise<number | void>; // Alias for backward compatibility
  refreshUserProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>;
  checkUserRole: (role: UserRole) => boolean;
  isEmailVerified: boolean;
  resendVerificationEmail: (email: string) => Promise<boolean>;
}
