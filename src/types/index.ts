
// Core Product type
export interface Product {
  id: string;
  title: string;
  price: number;
  images?: string[];
  stock?: number;
  slug?: string;
  description?: string;
  category?: string;
  kiosk_token?: string;
  external_id?: string;
  api_name?: string;
  api_stock?: number;
  api_price?: number;
  last_synced_at?: string;
}

// Basic order types
export interface Order {
  id: string;
  user_id: string;
  status: string;
  total_price: number;
  created_at: string;
  updated_at?: string;
  // Update the keys type to allow for Json type from Supabase
  keys?: string[] | any; // Making it flexible to handle Json type
  product_id?: string;
  qty?: number;
  user?: {
    email: string;
  };
  product?: {
    title: string;
  };
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

// Simple sort option
export type SortOption = string;

// Simple filter params
export interface FilterParams {
  [key: string]: string | number | boolean;
}

// Category type
export interface Category {
  id: string;
  name: string;
  description?: string;
  slug: string;
  image?: string;
  parent_id?: string;
}

// Sync status type
export type SyncStatus = 'idle' | 'loading' | 'success' | 'error';
