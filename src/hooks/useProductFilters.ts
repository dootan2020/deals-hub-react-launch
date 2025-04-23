
import { useState } from 'react';
import { SortOption, FilterParams } from '@/types';
import { useSearchParams } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

export interface ProductFilters {
  sort: SortOption;
  priceRange: [number, number];
  stockFilter: 'all' | 'in-stock' | 'low-stock';
  activeSubcategories: string[];
}

export const useProductFilters = (initialFilters?: Partial<ProductFilters>) => {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Helper to safely cast string to SortOption
  const getSortOption = (value: string | null): SortOption => {
    const validOptions: SortOption[] = ['popular', 'price-low', 'price-high', 'newest', 'recommended'];
    return value && validOptions.includes(value as SortOption) 
      ? value as SortOption 
      : initialFilters?.sort || 'popular';
  };
  
  // Initialize filters from URL or defaults
  const [filters, setFilters] = useState<ProductFilters>({
    sort: getSortOption(searchParams.get('sort')),
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
      toast({
        title: "Sắp xếp sản phẩm",
        description: `Đã sắp xếp theo ${getSortLabel(newFilters.sort)}`,
      });
    }
    
    if (newFilters.priceRange) {
      params.set('minPrice', newFilters.priceRange[0].toString());
      params.set('maxPrice', newFilters.priceRange[1].toString());
      toast({
        title: "Lọc theo giá",
        description: `Từ ${formatPrice(newFilters.priceRange[0])} đến ${formatPrice(newFilters.priceRange[1])}`,
      });
    }
    
    if (newFilters.stockFilter) {
      params.set('stock', newFilters.stockFilter);
      toast({
        title: "Lọc theo kho",
        description: getStockFilterLabel(newFilters.stockFilter),
      });
    }
    
    if (newFilters.activeSubcategories) {
      if (newFilters.activeSubcategories.length > 0) {
        params.set('categories', newFilters.activeSubcategories.join(','));
        toast({
          title: "Lọc theo danh mục",
          description: `Đã chọn ${newFilters.activeSubcategories.length} danh mục`,
        });
      } else {
        params.delete('categories');
      }
    }

    setSearchParams(params);
  };

  // Helper functions for toast messages
  const getSortLabel = (sort: SortOption): string => {
    switch (sort) {
      case 'newest': return 'Mới nhất';
      case 'popular': return 'Phổ biến nhất';
      case 'price-low': return 'Giá tăng dần';
      case 'price-high': return 'Giá giảm dần';
      default: return 'Mới nhất';
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStockFilterLabel = (filter: string): string => {
    switch (filter) {
      case 'in-stock': return 'Chỉ hiển thị sản phẩm còn hàng';
      case 'all': return 'Hiển thị tất cả sản phẩm';
      default: return 'Hiển thị tất cả sản phẩm';
    }
  };

  const handleSortChange = (newSort: string) => {
    // Safely cast the string to SortOption
    updateFilters({ sort: getSortOption(newSort) });
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
    sort: filters.sort,
    minPrice: filters.priceRange[0],
    maxPrice: filters.priceRange[1],
    inStock: filters.stockFilter === 'in-stock' ? true : undefined,
    category: filters.activeSubcategories.length > 0 ? filters.activeSubcategories[0] : undefined,
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
