
// Product type
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number | null;
  in_stock: boolean;
  slug: string;
  external_id?: string | null;
  category_id: string;
  images?: string[] | null;
  kiosk_token?: string | null;
  stock: number;
  api_name?: string | null;
  api_price?: number | null;
  api_stock?: number | null;
  created_at?: string;
  updated_at?: string;
}

// Category type
export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  count: number;
  parent_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Order type
export interface Order {
  id: string;
  user_id: string;
  product_id?: string | null;
  qty: number;
  total_price: number;
  status: string;
  external_order_id?: string | null;
  promotion_code?: string | null;
  keys?: Json | null;
  created_at?: string;
  updated_at?: string;
}

// Order Item type
export interface OrderItem {
  id: string;
  order_id?: string | null;
  product_id?: string | null;
  quantity: number;
  price: number;
  external_product_id?: string | null;
  created_at?: string;
}

// Deposit type
export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  net_amount: number;
  payment_method: string;
  status: string;
  transaction_id?: string;
  payer_id?: string;
  payer_email?: string;
  created_at: string;
  updated_at?: string;
}

// ProxyType and ProxySettings
export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'direct' | 'custom';

export interface ProxySettings {
  id: string;
  proxy_type: ProxyType;
  custom_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

// JSON type for TypeScript
export type Json = string | number | boolean | null | { [key: string]: Json } | Json[];

// API Response interface for products
export interface ApiResponse {
  success?: string;
  name?: string;
  price?: string;
  stock?: string;
  description?: string;
  kioskToken?: string;
  error?: string;
  [key: string]: any;
}

// Define the SortOption type for product sorting
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'popular' | 'price-low' | 'price-high';

// Define other types needed in the application
export interface ProductWithCategory extends Product {
  category: Category;
}

export interface FilterParams {
  sort: SortOption;
  category?: string;
  categoryId?: string;
  search?: string;
  inStock?: boolean;
  page?: number;
  priceMin?: number;
  priceMax?: number;
  subcategories?: string[];
  limit?: number;
}

// ProxyConfig interface
export interface ProxyConfig {
  proxy_type: ProxyType;
  custom_url?: string;
}
