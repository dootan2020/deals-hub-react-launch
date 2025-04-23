
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  count: number;
  parentId: string | null;
  createdAt?: string;
  category: Category | null;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  badges: string[];
  features: string[];
  specifications: Record<string, string>;
  salesCount: number;
  stock: number;
  kiosk_token: string;
  createdAt: string;
  category: Category | null;
}

export interface FilterParams {
  category?: string;
  subcategory?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: SortOption;
  sort?: SortOption;
  page?: number;
  perPage?: number;
  isProductsPage?: boolean;
  categoryId?: string;
}

export type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest' | 'recommended';

// Re-export for compatibility with existing code
export { UserRole } from './auth.types';
export type { UserRole as UserRoleType } from './auth.types';

export interface Order {
  id: string;
  user_id: string;
  external_order_id: string | null;
  status: string;
  total_amount: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  user: any;
  order_items: OrderItem[];
  qty?: number;
  product_id?: string;
  keys?: any;
  promotion_code?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  price: number;
  quantity: number;
  product?: Product;
  external_product_id?: string;
}

// Add missing recommendation types
export interface Recommendation {
  id: string;
  title: string;
  price: number;
  image: string;
  slug: string;
  score?: number;
  reason?: string;
}

// Define RecommendationStrategy to include all possible values
export type RecommendationStrategy = 'similar' | 'popular' | 'trending' | 'local' | 'openai' | 'claude';

// Add AISource type to match RecommendationStrategy
export type AISource = 'openai' | 'claude' | 'local' | 'similar' | 'popular' | 'trending';

// Add ProxyConfig type with all needed properties
export interface ProxyConfig {
  proxy_type: string;
  custom_url?: string;
  id?: string;
  type?: string;  // Added for compatibility with existing code
}
