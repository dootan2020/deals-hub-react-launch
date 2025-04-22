
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from './database.types';

export type UserRole = 'admin' | 'staff' | 'user' | 'guest';

export interface UserProfile {
  id: string;
  email: string | null;
  displayName: string | null;
  avatarUrl: string | null;
  roles: UserRole[];
  balance: number;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  access: string | null;
  refresh: string | null;
  expires: number | null;
}

export interface AuthState {
  initialized: boolean;
  loading: boolean;
  error: Error | null;
  user: UserProfile | null;
  tokens: AuthTokens;
  isAuthenticated: boolean;
}

export interface AuthSession {
  user: UserProfile | null;
  tokens: AuthTokens;
  expires: number | null;
}

export interface AuthError extends Error {
  status?: number;
  code?: string;
}

export type AuthContextType = {
  initialized: boolean;
  loading: boolean;
  user: UserProfile | null;
  error: AuthError | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, data?: any) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

export interface DatabaseUserProfile extends Database['public']['Tables']['profiles']['Row'] {
  roles?: UserRole[];
  display_name?: string | null;
  email_verified?: boolean;
}

// API Response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

// Proxy types
export type ProxyType = 'allorigins' | 'cors-anywhere' | 'custom';

export interface ProxySettings {
  id: string;
  proxy_type: ProxyType;
  custom_url?: string;
  created_at?: string;
  updated_at?: string;
}
