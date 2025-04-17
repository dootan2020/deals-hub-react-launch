
import { Category, Product } from '@/types';

export interface CategoryWithParent extends Category {
  parent?: CategoryWithParent;
}

export interface CategoryPageParams extends Record<string, string> {
  categorySlug?: string;
  parentCategorySlug?: string;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
}

export interface ProductData {
  id: string;
  title: string;
  description: string;
  price: number;
  original_price?: number;
  images?: string[];
  category_id: string;
  rating?: number;
  review_count?: number;
  in_stock?: boolean;
  stock_quantity?: number;
  badges?: string[] | null;
  slug: string;
  features?: string[] | null;
  specifications?: any;
  created_at?: string;
  sales_count?: number | null;
  external_id?: string;
  api_name?: string;
  api_price?: number;
  api_stock?: number;
  last_synced_at?: string;
  updated_at?: string;
  kiosk_token?: string;
}
