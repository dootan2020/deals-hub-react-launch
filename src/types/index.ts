import { TableHTMLAttributes } from 'react';

export interface Product {
  id: string;
  title: string;
  price: number;
  kiosk_token: string;
  stock: number;
  inStock: boolean;
  slug: string;
  createdAt: string;
  specifications: Record<string, string | number | boolean | object>;
  
  // Make optional fields explicitly optional
  description?: string;
  shortDescription?: string;
  images?: string[];
  categoryId?: string;
  categories?: Category;
  badges?: string[];
  originalPrice?: number;
  stockQuantity?: number;
  salesCount?: number;
  sales_count?: number;
  rating?: number;
  reviewCount?: number;
  features?: string[];
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
  subcategory?: string;
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
