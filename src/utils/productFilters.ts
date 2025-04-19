
import { Product } from '@/types';

/**
 * Filter products based on specified criteria
 */
export const applyFilters = (products: Product[], filters: any = {}): Product[] => {
  let filteredProducts = [...products];
  
  // Filter by price range
  if (filters.priceRange) {
    const [min, max] = filters.priceRange;
    if (min !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price >= min);
    }
    if (max !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.price <= max);
    }
  }
  
  // Filter by rating
  if (filters.rating !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.rating >= filters.rating);
  }
  
  // Filter by availability (in stock)
  if (filters.inStock === true) {
    filteredProducts = filteredProducts.filter(p => p.inStock);
  }
  
  return filteredProducts;
};

// Define the sort option type to ensure consistency across the application
export type SortOption = 'newest' | 'popular' | 'price-low' | 'price-high' | 'recommended';

/**
 * Sort products based on specified sort criteria
 */
export const sortProducts = (products: Product[], sortOption?: string): Product[] => {
  if (!sortOption) return products;
  
  const sortedProducts = [...products];
  
  switch (sortOption) {
    case 'price-low':
      return sortedProducts.sort((a, b) => a.price - b.price);
      
    case 'price-high':
      return sortedProducts.sort((a, b) => b.price - a.price);
      
    case 'newest':
      return sortedProducts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
    case 'popular':
      // Sort by sales count
      return sortedProducts.sort((a, b) => (b.salesCount || 0) - (a.salesCount || 0));
      
    case 'recommended':
    default:
      // Sort by a combination of sales count and creation date
      return sortedProducts.sort((a, b) => {
        const salesDiff = (b.salesCount || 0) - (a.salesCount || 0);
        
        // If sales count is the same, sort by date (newest first)
        if (salesDiff === 0) {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        }
        
        return salesDiff;
      });
  }
};
