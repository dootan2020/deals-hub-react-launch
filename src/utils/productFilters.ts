
import { Product, FilterParams } from '@/types';

/**
 * Applies filters to a list of products
 */
export const applyFilters = (products: Product[], filters: FilterParams): Product[] => {
  return products.filter(product => {
    // Price Range Filter
    if (filters.priceRange && filters.priceRange.length > 0) {
      const price = product.price;
      const matchesPrice = filters.priceRange.some(range => {
        switch (range) {
          case 'under25':
            return price < 25;
          case '25to50':
            return price >= 25 && price <= 50;
          case '50to100':
            return price > 50 && price <= 100;
          case 'over100':
            return price > 100;
          default:
            return true;
        }
      });
      
      if (!matchesPrice) return false;
    }
    
    // Rating Filter
    if (filters.rating && filters.rating.length > 0) {
      const rating = product.rating;
      const matchesRating = filters.rating.some(ratingOption => {
        switch (ratingOption) {
          case '4star':
            return rating >= 4;
          case '3star':
            return rating >= 3;
          default:
            return true;
        }
      });
      
      if (!matchesRating) return false;
    }
    
    // In Stock Filter
    if (filters.inStock) {
      if (!product.inStock) return false;
    }
    
    return true;
  });
};

/**
 * Sorts products based on the sorting option
 */
export const sortProducts = (products: Product[], sortOption: string = 'recommended'): Product[] => {
  const sortedProducts = [...products];
  
  switch (sortOption) {
    case 'price_asc':
      return sortedProducts.sort((a, b) => a.price - b.price);
      
    case 'price_desc':
      return sortedProducts.sort((a, b) => b.price - a.price);
      
    case 'newest':
      // Use createdAt if available, fallback to ID as proxy for ordering
      return sortedProducts.sort((a, b) => {
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        return b.id.localeCompare(a.id);
      });
      
    case 'rating':
      return sortedProducts.sort((a, b) => {
        // First by rating (descending)
        if (b.rating !== a.rating) {
          return b.rating - a.rating;
        }
        // Then by review count (descending)
        return b.reviewCount - a.reviewCount;
      });
      
    case 'bestselling':
      return sortedProducts.sort((a, b) => {
        // First by sales count (descending)
        const aSales = a.salesCount || 0;
        const bSales = b.salesCount || 0;
        
        if (bSales !== aSales) {
          return bSales - aSales;
        }
        
        // If same sales count, sort by newest
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        return b.id.localeCompare(a.id);
      });
      
    case 'recommended':
    default:
      // For recommended, use a combination of factors (sales, rating, newness)
      return sortedProducts.sort((a, b) => {
        const aSales = a.salesCount || 0;
        const bSales = b.salesCount || 0;
        
        // First by sales with some weight
        const salesDiff = (bSales - aSales) * 0.5;
        
        // Then by rating with some weight
        const ratingDiff = (b.rating - a.rating) * 2;
        
        // Combined score
        const scoreA = aSales * 0.5 + a.rating * 2;
        const scoreB = bSales * 0.5 + b.rating * 2;
        
        if (scoreB !== scoreA) {
          return scoreB - scoreA;
        }
        
        // If scores are equal, use date as tiebreaker
        if (a.createdAt && b.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        
        return b.id.localeCompare(a.id);
      });
  }
};

/**
 * Parse filter parameters from URL search params
 */
export const parseFilterParams = (searchParams: URLSearchParams): FilterParams => {
  const params: FilterParams = {};
  
  // Price Range Filters
  const priceRange = searchParams.getAll('price');
  if (priceRange.length > 0) {
    params.priceRange = priceRange;
  }
  
  // Rating Filters
  const rating = searchParams.getAll('rating');
  if (rating.length > 0) {
    params.rating = rating;
  }
  
  // In Stock Filter
  const inStock = searchParams.get('inStock');
  if (inStock === 'true') {
    params.inStock = true;
  }
  
  // Sort Option
  const sort = searchParams.get('sort');
  if (sort) {
    params.sort = sort;
  }
  
  // Page Number
  const page = searchParams.get('page');
  if (page) {
    params.page = parseInt(page, 10);
  }
  
  return params;
};

/**
 * Convert filter params to URL search params
 */
export const filtersToSearchParams = (filters: FilterParams, currentSearchParams?: URLSearchParams): URLSearchParams => {
  const searchParams = currentSearchParams ? new URLSearchParams(currentSearchParams) : new URLSearchParams();
  
  // Clear existing filter params
  searchParams.delete('price');
  searchParams.delete('rating');
  searchParams.delete('inStock');
  searchParams.delete('sort');
  
  // Add price range filters
  if (filters.priceRange && filters.priceRange.length > 0) {
    filters.priceRange.forEach(price => {
      searchParams.append('price', price);
    });
  }
  
  // Add rating filters
  if (filters.rating && filters.rating.length > 0) {
    filters.rating.forEach(rating => {
      searchParams.append('rating', rating);
    });
  }
  
  // Add in stock filter
  if (filters.inStock) {
    searchParams.set('inStock', 'true');
  }
  
  // Add sort option
  if (filters.sort) {
    searchParams.set('sort', filters.sort);
  }
  
  // Add page number
  if (filters.page && filters.page > 1) {
    searchParams.set('page', String(filters.page));
  } else {
    searchParams.delete('page');
  }
  
  return searchParams;
};
