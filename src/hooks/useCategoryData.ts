
import { useState, useEffect } from 'react';
import { Category, Product } from '@/types';
import { CategoryPageParams, SubcategoryDisplay } from '@/types/category.types';
import { useCategory } from './useCategory';
import { useCategoryProducts } from './useCategoryProducts';
import { supabase } from '@/integrations/supabase/client';

export const useCategoryData = ({ categorySlug, parentCategorySlug }: CategoryPageParams) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [activeFilters, setActiveFilters] = useState({ sort: 'recommended' });
  const [subcategories, setSubcategories] = useState<SubcategoryDisplay[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

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

  useEffect(() => {
    const fetchSubcategories = async () => {
      if (!category?.id) return;
      
      const { data } = await supabase
        .from('categories')
        .select('*')
        .eq('parent_id', category.id);
        
      if (data) {
        setSubcategories(data.map(sub => ({
          id: sub.id,
          name: sub.name,
          slug: sub.slug,
          description: sub.description,
          image: sub.image,
          count: sub.count || 0
        })));

        // Fetch featured products for each subcategory
        const featuredData = await supabase
          .from('products')
          .select('*')
          .in('category_id', data.map(sub => sub.id))
          .limit(4);
          
        if (featuredData.data) {
          setFeaturedProducts(featuredData.data.map(p => ({
            id: p.id,
            title: p.title,
            description: p.description,
            shortDescription: p.short_description || '',
            price: Number(p.price),
            originalPrice: p.original_price ? Number(p.original_price) : undefined,
            images: p.images || [],
            categoryId: p.category_id,
            rating: Number(p.rating || 0),
            reviewCount: p.review_count || 0,
            inStock: p.in_stock || false,
            stockQuantity: p.stock_quantity || 0,
            badges: p.badges || [],
            slug: p.slug,
            features: p.features || [],
            specifications: p.specifications || {},
            createdAt: p.created_at
          })));
        }
      }
    };

    fetchSubcategories();
  }, [category?.id]);

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
    featuredProducts
  };
};

