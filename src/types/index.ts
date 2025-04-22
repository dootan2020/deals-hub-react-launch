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
  salesCount?: number;
  sales_count?: number;
  createdAt: string;
  kiosk_token: string;
  stock: number;
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

export type SortOption = 'newest' | 'popular' | 'price-low' | 'price-high';

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
  limit?: number;
  priceRange?: [number, number];
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
