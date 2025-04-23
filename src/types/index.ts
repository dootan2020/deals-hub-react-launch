
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
  originalPrice?: number;
  badges?: string[];
  inStock?: boolean;
  kiosk_token?: string;
}

// User roles - simplified to only Admin and User
export enum UserRole {
  Admin = 'Admin',
  User = 'User'
}

export type UserRoleType = keyof typeof UserRole;

// Sort options for product listings
export type SortOption = 
  | 'recommended' 
  | 'newest' 
  | 'price-asc' 
  | 'price-desc' 
  | 'rating' 
  | 'popularity'
  | 'popular'
  | 'price-low'
  | 'price-high';

// Product view modes
export type ViewMode = 'grid' | 'list';

// Basic order types
export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_amount: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  external_order_id?: string;
  user?: any;
  order_items?: OrderItem[];
  qty?: number;
  product_id?: string;
  keys?: any;
  promotion_code?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

// Category type
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  count: number;
  parent_id?: string;
  created_at?: string;
  updated_at?: string;
}

// Added some missing types referenced in the hooks
export interface FilterParams {
  sort?: SortOption;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  page?: number;
  limit?: number;
  featured?: boolean;
}

export interface Recommendation {
  id: string;
  title: string;
  description?: string;
  products: Product[];
}

export type RecommendationStrategy = 'popular' | 'recently-viewed' | 'personalized';

export interface ProxyConfig {
  id: string;
  proxy_type: string;
  custom_url?: string;
  created_at?: string;
  updated_at?: string;
}
