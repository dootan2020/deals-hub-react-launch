import { TableHTMLAttributes } from 'react';
import { Json } from '@/integrations/supabase/types';

export interface Product {
  id: string;
  title: string;
  description: string;
  shortDescription?: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
    [key: string]: any;
  };
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  badges: string[];
  slug: string;
  features: string[];
  specifications: Record<string, string | number | boolean | object>;
  salesCount?: number;
  sales_count?: number;
  createdAt: string;
  kiosk_token: string;
  stock: number;
  recommended?: boolean;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  slug: string;
  image: string;
  count: number;
  parent_id?: string | null;
  subcategories?: Category[];
}

export interface SortOption {
  label: string;
  value: string;
}

export interface FilterParams {
  categoryId?: string;
  subcategory?: string;
  inStock?: boolean;
  search?: string;
  sort?: string;
  page?: number;
  perPage?: number;
  priceRange?: [number, number] | { min: number; max: number };
}

export interface CategoryPageParams extends Record<string, string> {
  categorySlug?: string;
  parentCategorySlug?: string;
}

export interface SubcategoryPageParams extends Record<string, string> {
  categorySlug?: string;
  parentCategorySlug?: string;
}

export interface ProductPageParams extends Record<string, string> {
  productSlug?: string;
  categorySlug?: string;
  parentCategorySlug?: string;
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface TableColumn<T> {
  header: string;
  accessorKey: keyof T | string;
  cell?: (info: { row: { original: T } }) => React.ReactNode;
}

export interface TableProps<T> extends TableHTMLAttributes<HTMLTableElement> {
  data: T[];
  columns: TableColumn<T>[];
  isLoading?: boolean;
}

export interface ProductKey {
  id: string;
  key_content: string;
  status: string;
  created_at: string;
  product_id?: string;
}

export interface OrderHistoryItem {
  id: string;
  created_at: string;
  qty: number;
  total_price: number;
  status: string;
  keys: Json | null;
  product: { title: string };
}

export interface AdminOrder {
  id: string;
  created_at: string;
  product_id: string | null;
  qty: number;
  total_price: number;
  status: string;
  keys: Json | null;
  external_order_id: string | null;
  promotion_code: string | null;
  updated_at: string;
  user_id: string;
  product?: {
    title: string;
  };
}
