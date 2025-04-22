
// Các kiểu dữ liệu cơ bản
export type ApiResponse = {
  success: string;
  name?: string;
  price?: string;
  stock?: string;
  description?: string;
  error?: string;
};

export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere' | 'direct' | 'custom';

export type ProxySettings = {
  id: string;
  proxy_type: ProxyType;
  custom_url: string | null;
};

export type Category = {
  id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  parent_id?: string | null;
  count: number;
  created_at?: string;
  updated_at?: string;
};

export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  in_stock: boolean;
  slug: string;
  category_id: string;
  external_id?: string;
  images?: string[];
  stock: number;
  kiosk_token?: string;
  badges?: string[];
  features?: string[];
  rating?: number;
  review_count?: number;
  created_at?: string;
  updated_at?: string;
  specifications?: Record<string, any>;
};

// Thêm các kiểu auth mới
export * from './auth.types';
