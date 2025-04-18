
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
    pagination,
    loading: productsLoading,
    handlePageChange,
    handleSortChange, 
  } = useCategoryProducts({
    categoryId: category?.id,
    isProductsPage: !categorySlug && !parentCategorySlug,
    sort: activeFilters.sort
  });

  const { subcategories, featuredProducts } = useSubcategories(category?.id);
  
  const loading = categoryLoading || productsLoading;

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
    pagination,
    handlePageChange,
    activeTab,
    setActiveTab,
    activeFilters,
    totalProducts: pagination.totalItems,
    handleSortChange: handleSort,
    buildBreadcrumbs,
    subcategories,
    featuredProducts,
    isProductsPage: !categorySlug && !parentCategorySlug
  };
};
