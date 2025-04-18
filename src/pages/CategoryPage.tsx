
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import CategoryFiltersSection from '@/components/category/CategoryFiltersSection';
import { CategoryHeader } from '@/components/category/CategoryHeader';
import SubcategoryPills from '@/components/category/SubcategoryPills';
import { useCategoryData } from '@/hooks/useCategoryData';
import LoadingState from '@/components/category/LoadingState';
import ErrorState from '@/components/category/ErrorState';
import ProductSorter from '@/components/product/ProductSorter';
import ViewToggle from '@/components/product/ViewToggle';

const CategoryPage: React.FC = () => {
  const params = useParams<{ categorySlug: string; parentCategorySlug: string }>();
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const {
    category,
    products,
    loading,
    error,
    handleSortChange,
    activeFilters,
    subcategories
  } = useCategoryData({
    categorySlug: params.categorySlug,
    parentCategorySlug: params.parentCategorySlug
  });
  
  if (loading) return <LoadingState />;
  if (error || !category) return <ErrorState />;

  // Chỉ hiển thị subcategories nếu category hiện tại là category chính (không có parent)
  const showSubcategories = !category.parent_id && subcategories.length > 0;

  return (
    <Layout>
      <div className="container-custom py-8">
        <CategoryHeader category={category} />
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block lg:col-span-3">
            <CategoryFiltersSection
              showFilters={true}
              onToggleFilters={() => {}}
              subcategories={subcategories}
              activeSubcategories={[]}
              onSubcategoryToggle={() => {}}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-9 space-y-8">
            {/* Subcategories Pills */}
            {showSubcategories && (
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <SubcategoryPills
                  subcategories={subcategories}
                />
              </div>
            )}

            {/* Products Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <ProductSorter
                  currentSort={activeFilters.sort || 'recommended'}
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
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
