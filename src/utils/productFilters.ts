
import { Product } from '@/types';

/**
 * Sort products based on specified sort criteria
 */
export const sortProducts = (products: Product[], sortOption?: string): Product[] => {
  if (!sortOption) return products;
  
  const sortedProducts = [...products];
  
  switch (sortOption) {
    case 'price-low-high':
      return sortedProducts.sort((a, b) => a.price - b.price);
      
    case 'price-high-low':
      return sortedProducts.sort((a, b) => b.price - a.price);
      
    case 'newest':
      return sortedProducts.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
    case 'rating':
      return sortedProducts.sort((a, b) => b.rating - a.rating);
      
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
