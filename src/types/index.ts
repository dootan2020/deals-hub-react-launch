
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  count: number;
  parentId: string | null;
  createdAt?: string;
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
  sort?: SortOption; // Added for backward compatibility
}

export type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest';

// Add the UserRole type needed by auth-related components
export type UserRole = 'admin' | 'user' | 'manager';

export interface Order {
  id: string;
  user_id: string;
  external_order_id: string | null;
  status: string;
  total_amount: number; // Used instead of total_price for consistency
  total_price?: number; // For backward compatibility
  created_at: string;
  updated_at: string;
  user: any;
  order_items: OrderItem[];
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
