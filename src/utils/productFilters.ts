
import { Product, FilterParams, SortOption } from '@/types';

/**
 * Filter products by category
 */
export const filterByCategory = (products: Product[], categoryId?: string): Product[] => {
  if (!categoryId) return products;
  return products.filter(product => product.categoryId === categoryId);
};

/**
 * Filter products by price range
 */
export const filterByPrice = (products: Product[], minPrice?: number, maxPrice?: number): Product[] => {
  let filteredProducts = products;
  
  if (minPrice !== undefined && minPrice > 0) {
    filteredProducts = filteredProducts.filter(product => product.price >= minPrice);
  }
  
  if (maxPrice !== undefined && maxPrice > 0) {
    filteredProducts = filteredProducts.filter(product => product.price <= maxPrice);
  }
  
  return filteredProducts;
};

/**
 * Filter products by availability
 */
export const filterByAvailability = (products: Product[], inStock?: boolean): Product[] => {
  if (inStock === undefined) return products;
  return products.filter(product => product.inStock === inStock);
};

/**
 * Sort products based on the sort option
 */
export const sortProducts = (products: Product[], sortBy?: SortOption): Product[] => {
  if (!sortBy || products.length === 0) return products;
  
  const productsCopy = [...products];
  
  switch (sortBy) {
    case 'price-low':
      return productsCopy.sort((a, b) => a.price - b.price);
    case 'price-high':
      return productsCopy.sort((a, b) => b.price - a.price);
    case 'newest':
      return productsCopy.sort((a, b) => {
        const dateA = new Date(a.createdAt).getTime();
        const dateB = new Date(b.createdAt).getTime();
        return dateB - dateA;
      });
    case 'popular':
      return productsCopy.sort((a, b) => b.salesCount - a.salesCount);
    case 'recommended':
      // For recommended, we might combine rating and sales count
      return productsCopy.sort((a, b) => {
        const scoreA = a.rating * 0.5 + a.salesCount * 0.5;
        const scoreB = b.rating * 0.5 + b.salesCount * 0.5;
        return scoreB - scoreA;
      });
    default:
      return productsCopy;
  }
};

/**
 * Apply all filters and sorting at once
 */
export const applyFilters = (products: Product[], filters: FilterParams): Product[] => {
  let filteredProducts = [...products];
  
  // Apply category filter
  if (filters.categoryId) {
    filteredProducts = filterByCategory(filteredProducts, filters.categoryId);
  } else if (filters.category) {
    filteredProducts = filterByCategory(filteredProducts, filters.category);
  }
  
  // Apply price range filter
  filteredProducts = filterByPrice(filteredProducts, filters.minPrice, filters.maxPrice);
  
  // Apply availability filter
  if (filters.inStock !== undefined) {
    filteredProducts = filterByAvailability(filteredProducts, filters.inStock);
  }
  
  // Apply sorting
  const sortOption = filters.sortBy || filters.sort;
  if (sortOption) {
    filteredProducts = sortProducts(filteredProducts, sortOption);
  }
  
  return filteredProducts;
};
