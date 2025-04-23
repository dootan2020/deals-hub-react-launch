export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  count: number;
  parentId: string | null;
  createdAt?: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string;
  price: number;
  originalPrice?: number;
  images: string[];
  categoryId: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  badges: string[];
  features: string[];
  specifications: Record<string, string>;
  salesCount: number;
  stock: number;
  kiosk_token: string;
  createdAt: string;
  category: Category | null;
}

// Add the FilterParams type that's being imported in useProductFilters.ts
export interface FilterParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  sortBy?: SortOption;
}

export type SortOption = 'popular' | 'price-low' | 'price-high' | 'newest';
