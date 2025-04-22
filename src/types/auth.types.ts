
export type UserRole = 'admin' | 'staff' | 'user';

export interface User {
  id: string;
  email: string | null;
  app_metadata?: {
    provider?: string;
    [key: string]: any;
  };
  user_metadata?: {
    [key: string]: any;
  };
  aud?: string;
  created_at?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  roles?: UserRole[];
  display_name?: string;
}

export interface AuthError {
  message: string;
  status?: number;
  name?: string;
  [key: string]: any;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  session: any;
  isOnline: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  refreshSession: () => Promise<boolean>;
  refreshUserProfile: () => Promise<void>;
  refreshUserBalance: () => Promise<number>;
  updateProfile: () => Promise<void>;
}

export interface AuthTokens {
  access: string | null;
  refresh: string | null;
  expires: number | null;
}
