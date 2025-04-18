
import { User, Session } from '@supabase/supabase-js';

export type UserRole = 'admin' | 'staff' | 'user' | 'guest';

export type AuthUser = User & {
  role?: UserRole;
};

export type AuthContextType = {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  userRoles: UserRole[];
  userBalance: number;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  checkUserRole: (role: UserRole) => boolean;
};
