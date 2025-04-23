
export type UserRole = 'admin' | 'user' | 'manager' | 'staff' | 'guest';

// Define UserRole as both type and enum-like object
export const UserRole = {
  Admin: 'admin' as UserRole,
  User: 'user' as UserRole,
  Manager: 'manager' as UserRole,
  Staff: 'staff' as UserRole,
  Guest: 'guest' as UserRole
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
  register?: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}
