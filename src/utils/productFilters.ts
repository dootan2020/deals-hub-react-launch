
import { Product, SortOption, FilterParams } from '@/types';

export const sortProducts = (products: Product[], sort: SortOption): Product[] => {
  const sorted = [...products];
  
  switch (sort) {
    case 'price-high':
      sorted.sort((a, b) => b.price - a.price);
      break;
    case 'price-low':
      sorted.sort((a, b) => a.price - b.price);
      break;
    case 'newest':
      sorted.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      break;
    case 'popular':
      // Sort by review_count or some other popularity metric
      sorted.sort((a, b) => (b.review_count || 0) - (a.review_count || 0));
      break;
    default:
      // Leave in original order
      break;
  }
  
  return sorted;
};

export const applyFilters = (products: Product[], filters: Partial<FilterParams>): Product[] => {
  return products.filter(product => {
    // Filter by search term
    if (filters.search && !product.title.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    
    // Filter by in-stock status
    if (filters.inStock !== undefined && product.in_stock !== filters.inStock) {
      return false;
    }
    
    // Filter by price range
    if (filters.priceMin !== undefined && product.price < filters.priceMin) {
      return false;
    }
    
    if (filters.priceMax !== undefined && product.price > filters.priceMax) {
      return false;
    }
    
    return true;
  });
};

export type { SortOption };
