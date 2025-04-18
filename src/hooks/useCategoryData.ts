
import { useState } from 'react';
import { CategoryPageParams } from '@/types/category.types';
import { useCategory } from './useCategory';
import { useCategoryProducts } from './useCategoryProducts';
import { useSubcategories } from './useSubcategories';

export const useCategoryData = ({ categorySlug, parentCategorySlug }: CategoryPageParams) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFilters, setActiveFilters] = useState({ sort: 'recommended' });

  // Remove console.log
  
  const { category, loading: categoryLoading, error } = useCategory({ 
    categorySlug, 
    parentCategorySlug 
  });
  
  // Remove console.log
  
  const { 
    products, 
    pagination,
    handlePageChange,
    loading: productsLoading 
  } = useCategoryProducts({
    categoryId: category?.id,
    isProductsPage: !categorySlug && !parentCategorySlug
  });

  // Remove console.log

  const { subcategories, featuredProducts } = useSubcategories(category?.id);
  
  const loading = categoryLoading || productsLoading;

  const handleSortChange = (sort: string) => {
    setActiveFilters(prev => ({ ...prev, sort }));
  };

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
    handleSortChange,
    buildBreadcrumbs,
    subcategories,
    featuredProducts,
    isProductsPage: !categorySlug && !parentCategorySlug
  };
};
