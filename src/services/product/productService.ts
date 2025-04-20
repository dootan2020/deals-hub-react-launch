
// Re-export all product service functionality
export * from './fetch';
export * from './mutations';
export * from './filtering';

import { FilterParams, Product } from '@/types';

// Define standard return type for fetchProductsWithFilters
export interface ProductResponse {
  products: Product[];
  total?: number;
  page?: number;
  totalPages?: number;
}

// No need to re-export ProductResponse as a type, since we're already exporting the interface
