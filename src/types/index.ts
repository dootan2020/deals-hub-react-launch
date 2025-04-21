
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
  stock_quantity?: number;
  rating?: number;
  review_count?: number;
  badges?: string[];
  features?: string[];
  specifications?: Record<string, any>;
  created_at?: string;
  updated_at?: string;
  last_synced_at?: string;
  category?: Category;
  
  // For compatibility with existing components, define aliases
  // These will help us transition to the correct snake_case names
  get originalPrice(): number | undefined {
    return this.original_price ?? undefined;
  }
  
  get shortDescription(): string | undefined {
    return this.short_description ?? undefined;
  }
  
  get categoryId(): string {
    return this.category_id;
  }
  
  get inStock(): boolean {
    return this.in_stock;
  }
  
  get salesCount(): number {
    return this.stock_quantity || 0;
  }
}

// Add SortOption type that was missing
export type SortOption = 'price-high' | 'price-low' | 'newest' | 'popular';

// Define FilterParams interface for product filtering 
export interface FilterParams {
  categoryId?: string;
  search?: string;
  inStock?: boolean;
  sort?: SortOption;
  page?: number;
  priceMin?: number;
  priceMax?: number;
}
