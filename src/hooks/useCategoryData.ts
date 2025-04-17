
import { Category, Product } from '@/types';
import { CategoryPageParams } from '@/types/category.types';
import { useCategory } from './useCategory';
import { useCategoryProducts } from './useCategoryProducts';

export const useCategoryData = ({ categorySlug, parentCategorySlug }: CategoryPageParams) => {
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

  return {
    category,
    products,
    loading,
    error,
    pagination,
    handlePageChange
  };
};
