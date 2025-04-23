
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  category: string;
  createdAt: string;
  updatedAt?: string;
  slug: string;
  // Add missing properties that are being referenced
  originalPrice?: number;
  inStock?: boolean;
  stock?: number;
  images?: string[];
  shortDescription?: string;
  categoryId?: string;
  kiosk_token?: string;
  badges?: string[];
  features?: string[];
  specifications?: Record<string, string | number | boolean | object>;
  sales_count?: number;
  salesCount?: number;
  reviewCount?: number;
  rating?: number;
  in_stock?: boolean; // For compatibility with database fields
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  count: number;
  parent_id: string | null;
}

export type SortOption = 'newest' | 'price_asc' | 'price_desc' | 'popularity';

export enum UserRole {
  User = 'user',
  Admin = 'admin',
  Staff = 'staff'
}

export interface AuthContextType {
  user: any;
  session: any;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStaff: boolean;
  userRoles: UserRole[];
  userBalance: number;
  refreshUserBalance: () => Promise<number | void>;
  refreshBalance: () => Promise<number | void>; // Alias for backward compatibility
  refreshUserProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  register: (email: string, password: string, metadata?: Record<string, any>) => Promise<any>;
  checkUserRole: (role: UserRole) => boolean;
  isEmailVerified?: boolean;
  resendVerificationEmail?: (email: string) => Promise<boolean>;
  isLoadingBalance?: boolean;
}
