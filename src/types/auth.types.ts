
export type UserRole = 'admin' | 'user' | 'manager';

export interface UserWithRoles {
  id: string;
  email: string;
  roles: UserRole[];
  displayName?: string;
  avatarUrl?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: any;
  userRoles: UserRole[];
  isAdmin: boolean;
  isManager: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
