
// Product related types
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

// User roles - CHỈ GIỮ Admin & User
export enum UserRole {
  Admin = 'Admin',
  User = 'User'
}

// Sort options core (có thể tạm thời loại các value không dùng)
export type SortOption = 'newest' | 'popular' | 'price-asc' | 'price-desc';

export type ViewMode = 'grid' | 'list';

// Basic order types
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
