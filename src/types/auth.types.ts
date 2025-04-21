
import { ReactNode } from 'react';

export type UserRole = 'user' | 'admin' | 'staff' | 'guest';

export interface User {
  id: string;
  email: string;
  email_confirmed_at?: string | null;
  user_metadata?: {
    display_name?: string;
    avatar_url?: string;
  };
  role?: UserRole;
  // Make these properties optional to fix the type error in MyAccountPage.tsx
  app_metadata?: any;
  aud?: string;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  session: any;
  loading: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  userRoles: UserRole[];
  userBalance: number;
  setUserBalance: (balance: number) => void;
  fetchUserBalance: (userId: string) => Promise<number>;
  refreshUserData: () => Promise<void>;
  isLoadingBalance: boolean;
  authError: Error | null;
}

export interface AuthContextType {
  user: User | null;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  userRoles: UserRole[];
  userBalance: number;
  refreshUserBalance: () => Promise<void>;
  refreshUserProfile: () => Promise<void>;
  refreshBalance: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (email: string, password: string, options?: any) => Promise<any>;
  checkUserRole: (role: UserRole) => boolean;
  isEmailVerified: boolean;
  resendVerificationEmail: (email: string) => Promise<boolean>;
  isLoadingBalance: boolean;
}
