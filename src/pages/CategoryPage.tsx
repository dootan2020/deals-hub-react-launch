
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import CategoryFiltersSection from '@/components/category/CategoryFiltersSection';
import MobileFilterToggle from '@/components/category/MobileFilterToggle';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import CategoryBreadcrumbs from '@/components/category/CategoryBreadcrumbs';
import { useCategoryData } from '@/hooks/useCategoryData';
import LoadingState from '@/components/category/LoadingState';
import ErrorState from '@/components/category/ErrorState';
import ProductSorter from '@/components/product/ProductSorter';

const CategoryPage: React.FC = () => {
  const params = useParams<{ categorySlug: string; parentCategorySlug: string }>();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [activeSubcategories, setActiveSubcategories] = useState<string[]>([]);
  
  const {
    category,
    products,
    loading,
    error,
    handleSortChange,
    activeFilters,
    buildBreadcrumbs,
    subcategories
  } = useCategoryData({
    categorySlug: params.categorySlug,
    parentCategorySlug: params.parentCategorySlug
  });
  
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };
  
  const handleSubcategoryToggle = (subcategoryId: string) => {
    setActiveSubcategories(prev => {
      if (prev.includes(subcategoryId)) {
        return prev.filter(id => id !== subcategoryId);
      } else {
        return [...prev, subcategoryId];
      }
    });
  };
  
  const filteredProducts = activeSubcategories.length > 0
    ? products.filter(product => {
        const subcategoryIds = subcategories.map(sub => sub.id);
        return activeSubcategories.some(subId => product.categoryId === subId);
      })
    : products;
  
  if (loading) return <LoadingState />;
  if (error || !category) return <ErrorState />;

  return (
    <Layout>
      <div className="container-custom py-6">
        <CategoryBreadcrumbs breadcrumbs={buildBreadcrumbs()} />
        <CategoryHeader category={category} />
        
        <div className="mt-6">
          <div className="flex justify-between items-center mb-6">
            <MobileFilterToggle
              onToggle={toggleMobileFilters}
              isOpen={showMobileFilters}
              activeFilterCount={activeSubcategories.length}
            />
            <ProductSorter
              currentSort={activeFilters.sort || 'recommended'}
              onSortChange={handleSortChange}
            />
          </div>
          
          <div className="flex flex-col md:flex-row gap-8">
            <CategoryFiltersSection
              showFilters={showMobileFilters}
              onToggleFilters={toggleMobileFilters}
              subcategories={subcategories}
              activeSubcategories={activeSubcategories}
              onSubcategoryToggle={handleSubcategoryToggle}
            />
            
            <div className="flex-1">
              <ProductGrid
                products={filteredProducts}
                showViewAll={false}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
