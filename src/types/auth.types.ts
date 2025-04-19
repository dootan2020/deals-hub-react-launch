
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'staff' | 'user' | 'guest';

export type AuthUser = User & {
  role?: UserRole;
};

export interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  userRoles: UserRole[];
  userBalance: number;
  refreshUserBalance: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  checkUserRole: (role: UserRole) => boolean;
}
