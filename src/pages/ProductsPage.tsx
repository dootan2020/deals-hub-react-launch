
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { useToast } from "@/components/ui/use-toast";
import ProductSorter from '@/components/product/ProductSorter';
import ViewToggle from '@/components/product/ViewToggle';
import { useCategoryProducts } from '@/hooks/useCategoryProducts';
import { useCategoriesContext } from '@/context/CategoriesContext';
import SubcategoriesGrid from '@/components/category/SubcategoriesGrid';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const initialSort = searchParams.get('sort') || 'recommended';
  const { mainCategories } = useCategoriesContext();
  
  const { 
    products, 
    loading: isLoading,
    handleSortChange: handleSort 
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

  return (
    <Layout>
      <div className="bg-background py-8 min-h-screen">
        <div className="container-custom">
          <div className="space-y-8">
            {/* Header Section */}
            <div>
              <h1 className="text-3xl font-bold mb-4">All Products</h1>
              <p className="text-muted-foreground">
                Browse our collection of digital products
              </p>
            </div>

            {/* Subcategories Section */}
            {mainCategories.length > 0 && (
              <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm">
                <SubcategoriesGrid 
                  categorySlug="" 
                  subcategories={mainCategories} 
                />
              </div>
            )}

            {/* Products Section */}
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
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
