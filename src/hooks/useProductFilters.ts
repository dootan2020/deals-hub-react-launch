
import { useState } from 'react';
import { SortOption, FilterParams } from '@/types';
import { useSearchParams } from 'react-router-dom';

export interface ProductFilters {
  sort: SortOption;
  priceRange: [number, number];
  stockFilter: 'all' | 'in-stock' | 'low-stock';
  activeSubcategories: string[];
}

export const useProductFilters = (initialFilters?: Partial<ProductFilters>) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<ProductFilters>({
    sort: (searchParams.get('sort') as SortOption) || initialFilters?.sort || 'popular',
    priceRange: [
      Number(searchParams.get('minPrice')) || initialFilters?.priceRange?.[0] || 0,
      Number(searchParams.get('maxPrice')) || initialFilters?.priceRange?.[1] || 500
    ],
    stockFilter: (searchParams.get('stock') as ProductFilters['stockFilter']) || initialFilters?.stockFilter || 'all',
    activeSubcategories: searchParams.get('categories')?.split(',').filter(Boolean) || initialFilters?.activeSubcategories || []
  });

  const updateFilters = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);

    // Update URL params
    const params = new URLSearchParams(searchParams);
    
    if (newFilters.sort) {
      params.set('sort', String(newFilters.sort));
    }
    
    if (newFilters.priceRange) {
      params.set('minPrice', newFilters.priceRange[0].toString());
      params.set('maxPrice', newFilters.priceRange[1].toString());
    }
    
    if (newFilters.stockFilter) {
      params.set('stock', newFilters.stockFilter);
    }
    
    if (newFilters.activeSubcategories) {
      if (newFilters.activeSubcategories.length > 0) {
        params.set('categories', newFilters.activeSubcategories.join(','));
      } else {
        params.delete('categories');
      }
    }

    setSearchParams(params);
  };

  // Helper methods for updating specific filters
  const handleSortChange = (newSort: string) => {
    updateFilters({ sort: newSort as SortOption });
  };

  const handlePriceChange = (min: number, max: number) => {
    updateFilters({ priceRange: [min, max] });
  };

  const handleStockFilterChange = (value: string) => {
    updateFilters({ stockFilter: value as ProductFilters['stockFilter'] });
  };

  const handleSubcategoryToggle = (id: string) => {
    const updatedCategories = filters.activeSubcategories.includes(id)
      ? filters.activeSubcategories.filter(catId => catId !== id)
      : [...filters.activeSubcategories, id];
      
    updateFilters({ activeSubcategories: updatedCategories });
  };

  // Convert filters to FilterParams for API requests
  const getFilterParams = (): FilterParams => ({
    sort: String(filters.sort),
    minPrice: filters.priceRange[0],
    maxPrice: filters.priceRange[1],
    inStock: filters.stockFilter === 'in-stock' ? true : undefined,
    categoryIds: filters.activeSubcategories.length > 0 ? filters.activeSubcategories : undefined,
  });

  return {
    filters,
    handleSortChange,
    handlePriceChange,
    handleStockFilterChange,
    handleSubcategoryToggle,
    getFilterParams,
  };
};
