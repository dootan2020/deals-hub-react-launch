
import { Product, FilterParams } from '@/types';

/**
 * Filter products based on specified criteria
 */
export const applyFilters = (products: Product[], filters: FilterParams = {}): Product[] => {
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
  
  // Search query filtering
  if (filters.search) {
    const searchTerms = filters.search.toLowerCase().split(' ').filter(Boolean);
    filteredProducts = filteredProducts.filter(p => {
      const titleMatch = searchTerms.some(term => 
        p.title.toLowerCase().includes(term)
      );
      const descMatch = p.description ? searchTerms.some(term => 
        p.description.toLowerCase().includes(term)
      ) : false;
      
      return titleMatch || descMatch;
    });
  }
  
  // Filter by availability (in stock)
  if (filters.inStock === true) {
    filteredProducts = filteredProducts.filter(p => 
      p.inStock && (p.stockQuantity > 0 || p.stock > 0)
    );
  }
  
  return filteredProducts;
};

// Update the SortOption type definition
export type SortOption = 'newest' | 'popular' | 'price-low' | 'price-high' | 'name-asc' | 'recommended';

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
      
    case 'name-asc':
      return sortedProducts.sort((a, b) => a.title.localeCompare(b.title));
      
    case 'popular':
      // Sort by sales count
      return sortedProducts.sort((a, b) => {
        const salesA = a.salesCount || a.sales_count || 0;
        const salesB = b.salesCount || b.sales_count || 0;
        return salesB - salesA;
      });
      
    case 'recommended':
    default:
      // Sort by a combination of sales count and creation date
      return sortedProducts.sort((a, b) => {
        const salesA = a.salesCount || a.sales_count || 0;
        const salesB = b.salesCount || b.sales_count || 0;
        const salesDiff = salesB - salesA;
        
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
