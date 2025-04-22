
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
  
  // Filter by rating (if product has rating property)
  if (filters.rating !== undefined) {
    filteredProducts = filteredProducts.filter(p => 
      p.rating !== undefined && p.rating >= filters.rating
    );
  }
  
  // Filter by availability (in stock)
  if (filters.inStock === true) {
    filteredProducts = filteredProducts.filter(p => p.inStock);
  }
  
  return filteredProducts;
};

// Define the sort option type using the same type from the main types file
import { SortOption } from '@/types';
export type { SortOption };

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
      // Sort by sales count (safely check for undefined)
      return sortedProducts.sort((a, b) => {
        const salesA = a.salesCount || 0;
        const salesB = b.salesCount || 0;
        return salesB - salesA;
      });
      
    default:
      // Default to newest if unknown sort option is provided
      return sortedProducts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
  }
};
