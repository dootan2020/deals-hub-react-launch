
import { useState } from 'react';
import { CategoryPageParams } from '@/types/category.types';
import { useCategory } from './useCategory';
import { useCategoryProducts } from './useCategoryProducts';
import { useSubcategories } from './useSubcategories';

export const useCategoryData = ({ categorySlug, parentCategorySlug }: CategoryPageParams) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFilters, setActiveFilters] = useState({ sort: 'recommended' });
  
  const { category, loading: categoryLoading, error } = useCategory({ 
    categorySlug, 
    parentCategorySlug 
  });
  
  const { 
    products, 
    loading: productsLoading,
    loadingMore,
    hasMore,
    loadMore,
    handleSortChange, 
    setSelectedCategory
  } = useCategoryProducts({
    categoryId: category?.id,
    isProductsPage: !categorySlug && !parentCategorySlug,
    sort: activeFilters.sort
  });

  const loading = categoryLoading || productsLoading;

  const { subcategories, featuredProducts } = useSubcategories(category?.id);
  
  const buildBreadcrumbs = () => {
    const result = [];
    if (category?.parent) {
      result.push(category.parent);
    }
    if (category) {
      result.push(category);
    }
    return result;
  };

  const handleSort = (newSort: string) => {
    setActiveFilters(prev => ({ ...prev, sort: newSort }));
    handleSortChange(newSort);
  };

  return {
    category,
    products,
    loading,
    error,
    loadingMore,
    hasMore,
    loadMore,
    activeTab,
    setActiveTab,
    activeFilters,
    handleSortChange: handleSort,
    buildBreadcrumbs,
    subcategories,
    featuredProducts,
    setSelectedCategory,
    isProductsPage: !categorySlug && !parentCategorySlug
  };
};
