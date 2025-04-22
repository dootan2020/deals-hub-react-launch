
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { toast } from '@/hooks/use-toast';
import ProductSorter from '@/components/product/ProductSorter';
import ViewToggle from '@/components/product/ViewToggle';
import { useCategoryProducts } from '@/hooks/useCategoryProducts';
import { useCategoriesContext } from '@/context/CategoriesContext';
import SubcategoryPills from '@/components/category/SubcategoryPills';
import { Category } from '@/types';
import { SortOption } from '@/types';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const initialSort = (searchParams.get('sort') || 'newest') as SortOption;
  const { categories } = useCategoriesContext();
  
  const subcategories = categories.filter(cat => cat.parent_id !== null);
  
  const { 
    products, 
    loading,
    loadingMore,
    hasMore,
    loadMore,
    handleSortChange: handleSort,
    setSelectedCategory 
  } = useCategoryProducts({
    isProductsPage: true,
    sort: initialSort
  });

  const handleSortChange = (value: string) => {
    handleSort(value);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', value);
    setSearchParams(newSearchParams);
  };

  const handleViewChange = (newView: 'grid' | 'list') => {
    setViewMode(newView);
  };

  const handleSubcategoryClick = (category: Category) => {
    setSelectedCategory(category.id);
    toast.success("Category Filter Applied", `Showing products from ${category.name}`);
  };

  return (
    <Layout>
      <div className="bg-background py-8 min-h-screen">
        <div className="container-custom">
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-4">All Products</h1>
              <p className="text-muted-foreground">
                Browse our collection of digital products
              </p>
            </div>

            {subcategories.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-100 shadow-sm">
                <div className="p-4">
                  <SubcategoryPills 
                    subcategories={subcategories}
                    onSubcategoryClick={handleSubcategoryClick}
                  />
                </div>
              </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
              <div className="flex justify-between items-center mb-6">
                <ProductSorter 
                  currentSort={initialSort} 
                  onSortChange={handleSortChange} 
                />
                <ViewToggle 
                  currentView={viewMode}
                  onViewChange={handleViewChange}
                />
              </div>

              <ProductGrid 
                products={products}
                viewMode={viewMode}
                isLoading={loading}
                loadingMore={loadingMore}
                hasMore={hasMore}
                onLoadMore={loadMore}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
