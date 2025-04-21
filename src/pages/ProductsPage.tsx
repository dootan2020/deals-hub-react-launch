
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
import { Category, SortOption } from '@/types';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const initialSort = (searchParams.get('sort') || 'newest') as SortOption;
  const { categories } = useCategoriesContext();
  
  const subcategories = categories.filter(cat => cat.parent_id !== null);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [currentSort, setCurrentSort] = useState<SortOption>(initialSort);
  
  const { 
    products, 
    loading,
    error
  } = useCategoryProducts({
    categoryId: selectedCategoryId,
    sort: currentSort
  });

  const handleSortChange = (value: string) => {
    setCurrentSort(value as SortOption);
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', value);
    setSearchParams(newSearchParams);
  };

  const handleViewChange = (newView: 'grid' | 'list') => {
    setViewMode(newView);
  };

  const handleSubcategoryClick = (category: Category) => {
    setSelectedCategoryId(category.id);
    toast({
      title: "Category Filter Applied",
      description: `Showing products from ${category.name}`
    });
  };

  // Mock functions for missing functionality
  const loadMore = () => {
    console.log('Loading more products...');
  };

  const loadingMore = false;
  const hasMore = false;

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
                  currentSort={currentSort} 
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
