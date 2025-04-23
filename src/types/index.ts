
// Simplified Product type
export interface Product {
  id: string;
  title: string;
  price: number;
  images?: string[];
  stock?: number;
  slug?: string;
  description?: string;
  category?: string;
}

// Basic order types - simplified
export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_price: number;
  created_at: string;
  updated_at?: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
}

// User roles - only Admin & User
export enum UserRole {
  Admin = 'Admin',
  User = 'User'
}

// View mode
export type ViewMode = 'grid' | 'list';

// Simplified Sort option
export type SortOption = string;
