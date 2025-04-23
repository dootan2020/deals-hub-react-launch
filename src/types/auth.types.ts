
export type UserRole = 'admin' | 'user' | 'manager';

// Define UserRole as both type and enum-like object
export const UserRole = {
  Admin: 'admin' as UserRole,
  User: 'user' as UserRole,
  Manager: 'manager' as UserRole
};

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
