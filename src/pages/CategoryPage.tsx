
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import SubcategoryPills from '@/components/category/SubcategoryPills';
import { useCategoryData } from '@/hooks/useCategoryData';
import LoadingState from '@/components/category/LoadingState';
import ErrorState from '@/components/category/ErrorState';
import ProductSorter from '@/components/product/ProductSorter';
import ViewToggle from '@/components/product/ViewToggle';
import { useCategoryProducts } from '@/hooks/useCategoryProducts';

const CategoryPage: React.FC = () => {
  const params = useParams<{ categorySlug: string; parentCategorySlug: string }>();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const {
    category,
    loading: categoryLoading,
    handleSortChange,
    activeFilters,
    subcategories,
    setSelectedCategory,
    currentSort
  } = useCategoryData({
    slug: params.categorySlug || ''
  });
  
  // Use a separate hook for product data
  const {
    products,
    loading: productsLoading,
    loadingMore,
    hasMore,
    loadMore,
    error
  } = useCategoryProducts({
    categoryId: category?.id,
    sort: currentSort
  });
  
  if (categoryLoading || productsLoading) return <LoadingState />;
  if (error || !category) return <ErrorState />;

  const showSubcategories = !category.parent_id && subcategories.length > 0;

  const handleSubcategoryClick = (subcategory: any) => {
    setSelectedCategory(subcategory.id);
  };

  return (
    <Layout>
      <div className="container-custom py-8">
        <CategoryHeader category={category} />
        
        <div className="space-y-8 mt-8">
          {/* Subcategories Pills */}
          {showSubcategories && (
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <SubcategoryPills
                subcategories={subcategories}
                onSubcategoryClick={handleSubcategoryClick}
              />
            </div>
          )}

          {/* Products Section */}
          <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <ProductSorter
                currentSort={activeFilters.sort || 'popular'}
                onSortChange={handleSortChange}
              />
              <ViewToggle
                currentView={viewMode}
                onViewChange={setViewMode}
              />
            </div>

            <ProductGrid
              products={products}
              viewMode={viewMode}
              isLoading={productsLoading}
              loadingMore={loadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
