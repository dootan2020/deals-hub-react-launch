
// Define the SortOption type for product sorting
export type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

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
  
  // Camel case getters for compatibility
  get originalPrice(): number | undefined {
    return this.original_price;
  }
  
  get shortDescription(): string {
    return this.short_description || this.description.substring(0, 100);
  }
  
  get categoryId(): string {
    return this.category_id;
  }
  
  get inStock(): boolean {
    return this.in_stock;
  }
  
  get stockQuantity(): number {
    return this.stock_quantity || this.stock || 0;
  }
  
  get reviewCount(): number {
    return this.review_count || 0;
  }
  
  get salesCount(): number {
    return 0; // Default value if not provided
  }
  
  get category(): Category | undefined {
    // This will be populated by the API when needed
    return undefined;
  }
}

export interface FilterParams {
  sort: SortOption;
  categoryId?: string;
  search?: string;
  inStock?: boolean;
  page?: number;
  priceMin?: number;
  priceMax?: number;
  subcategories?: string[];
}
