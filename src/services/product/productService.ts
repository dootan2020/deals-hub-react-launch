
// Re-export all product service functionality
export * from './fetch';
export * from './mutations';
export * from './filtering';

import { FilterParams, Product } from '@/types';

// Định nghĩa kiểu trả về chuẩn cho fetchProductsWithFilters
export interface ProductResponse {
  products: Product[];
  total?: number;
  page?: number;
  totalPages?: number;
}

// Đảm bảo interface này được export để các file khác có thể sử dụng
export { ProductResponse };
