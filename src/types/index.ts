
import { Json } from './database.types';

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  count: number;
  parent_id?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

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
  images?: string[];
  kiosk_token?: string | null;
  stock: number;
  api_price?: number | null;
  api_stock?: number | null;
  api_name?: string | null;
  short_description?: string | null;
  stockQuantity?: number;
  rating?: number;
  review_count?: number;
  badges?: string[];
  features?: string[];
  specifications?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  last_synced_at?: string;
  category?: Category;
}
