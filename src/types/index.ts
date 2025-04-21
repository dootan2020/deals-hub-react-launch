
// Define the SortOption type for product sorting
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc' | 'popular' | 'price-low' | 'price-high';

// Define other types needed in the application
export interface Category {
  id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
  count: number;
  parent_id?: string | null;
  subcategories?: Category[];
}

export interface ProductWithCategory extends Product {
  category: Category;
}

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  images: string[];
  category_id: string;
  rating: number;
  review_count: number;
  in_stock: boolean;
  stock_quantity?: number;
  badges?: string[];
  slug: string;
  features?: string[];
  specifications: Record<string, string | number | boolean | object>;
  stock: number;
  kiosk_token?: string;
  original_price?: number;
  short_description?: string;
  createdAt: string;
  category?: Category;
  
  // Properties to ensure compatibility with both naming conventions
  readonly originalPrice?: number;
  readonly shortDescription: string;
  readonly categoryId: string;
  readonly inStock: boolean;
  readonly stockQuantity: number;
  readonly reviewCount: number;
  readonly salesCount: number;
}

export interface FilterParams {
  sort: SortOption;
  category?: string;
  categoryId?: string;
  search?: string;
  inStock?: boolean;
  page?: number;
  priceMin?: number;
  priceMax?: number;
  subcategories?: string[];
}
