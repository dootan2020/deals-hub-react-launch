
import { useState, useEffect } from 'react';
import { Product, Category, SortOption, FilterParams } from '@/types';
import { UseCategoryProductsOptions, useCategoryProducts } from './useCategoryProducts';
import { useCategory } from './useCategory';
import { CategoryWithParent } from '@/types/category.types';

interface UseCategoryDataOptions {
  categorySlug: string;
  parentCategorySlug?: string;
  initialSort?: SortOption;
}

export function useCategoryData(options: UseCategoryDataOptions) {
  const { categorySlug, parentCategorySlug } = options;
  const [sort, setSort] = useState<SortOption>(options.initialSort || 'newest');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Get category data
  const { 
    category,
    loading: categoryLoading,
    error: categoryError
  } = useCategory({ categorySlug, parentCategorySlug });
  
  // Get products for this category using the options object format
  const {
    products, 
    childCategories: subcategories,
    loading: productsLoading,
    error: productsError,
    total,
    fetchMore: originalFetchMore,
    refresh,
    handleSortChange: handleSortChangeFromProducts,
    sort: sortFromProducts
  } = useCategoryProducts({
    categorySlug,
    filterParams: {
      sort
    },
    limit: 10,
    page: 1
  } as UseCategoryProductsOptions);
  
  // Handle additional loading state when fetching more
  const loadMore = async () => {
    setLoadingMore(true);
    await originalFetchMore();
    setLoadingMore(false);
  };
  
  // Calculate if more products can be loaded
  const hasMore = total > products.length;
  
  // Handle sort changes
  const handleSortChange = (newSort: SortOption) => {
    setSort(newSort);
    if (handleSortChangeFromProducts) {
      handleSortChangeFromProducts(newSort);
    } else {
      refresh();
    }
  };

  // Create an activeFilters object for components that expect it
  const activeFilters: FilterParams = {
    sort
  };
  
  return {
    products,
    category,
    childCategories: subcategories,
    subcategories, // Added for compatibility
    loading: categoryLoading || productsLoading,
    error: categoryError || productsError,
    total,
    fetchMore: originalFetchMore,
    refresh,
    loadingMore,
    hasMore,
    loadMore,
    handleSortChange,
    setSelectedCategory,
    sort,
    activeFilters // Added for compatibility
  };
}
