
// Product related types - simplified
export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  category: string;
  categoryId: string;
  stock: number;
  createdAt: string;
  updatedAt: string;
}

// User roles - only Admin & User
export enum UserRole {
  Admin = 'Admin',
  User = 'User'
}

// Sort option - simplified
export type SortOption = string;

// View mode
export type ViewMode = 'grid' | 'list';

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

// Basic category type
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

// Basic deposit type
export interface Deposit {
  id: string;
  user_id: string;
  amount: number;
  net_amount: number;
  transaction_id: string | null;
  payment_method: string;
  status: string;
  payer_email: string | null;
  payer_id: string | null;
  created_at: string;
  updated_at: string;
}
