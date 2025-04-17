
import { useState } from 'react';
import { Category, Product } from '@/types';
import { CategoryPageParams } from '@/types/category.types';
import { useCategory } from './useCategory';
import { useCategoryProducts } from './useCategoryProducts';

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
    handlePageChange,
    loading: productsLoading 
  } = useCategoryProducts({
    categoryId: category?.id
  });

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
    buildBreadcrumbs
  };
};
