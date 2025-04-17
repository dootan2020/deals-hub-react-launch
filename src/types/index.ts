
import { TableHTMLAttributes } from 'react';

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
  salesCount: number;
  createdAt: string;
  kiosk_token?: string;
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
  minPrice?: number;
  maxPrice?: number;
  ratings?: number[];
  search?: string;
  tags?: string[];
  inStock?: boolean;
  sort?: string;
  page?: number;
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
