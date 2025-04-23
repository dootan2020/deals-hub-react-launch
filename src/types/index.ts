
// Product related types
export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  salePrice: number | null;
  images: string[];
  category: string;
  categoryId: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
  tags?: string[];
  featured?: boolean;
  status?: 'active' | 'inactive' | 'draft';
  rating?: number;
  numberOfRatings?: number;
}

// User roles
export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Support = 'support',
  Affiliate = 'affiliate',
  User = 'user'
}

export type UserRoleType = keyof typeof UserRole;

// Sort options for product listings
export type SortOption = 
  | 'recommended' 
  | 'newest' 
  | 'price-asc' 
  | 'price-desc' 
  | 'rating' 
  | 'popularity';

// Product view modes
export type ViewMode = 'grid' | 'list';
