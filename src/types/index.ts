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
  sales_count?: number;  // Added this line to match backend naming convention
  createdAt: string;
  kiosk_token: string;  // Changed from optional to required
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

export interface SortOption {
  label: string;
  value: string;
}

export interface FilterParams {
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  ratings?: number[]; // Changed from 'rating' to 'ratings' for consistency
  search?: string;
  tags?: string[];
  inStock?: boolean;
  sort?: string;
  page?: number;
  limit?: number;
  priceRange?: [number, number]; // Changed from {min, max} to tuple for consistency with usage
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
  order_id?: string;
}
