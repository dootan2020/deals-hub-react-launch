
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from 'lucide-react';
import ProductSorter from '@/components/product/ProductSorter';
import { useCategoryProducts } from '@/hooks/useCategoryProducts';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const initialSort = searchParams.get('sort') || 'recommended';
  
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
    
    // Update URL search params
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', value);
    setSearchParams(newSearchParams);
  };

  return (
    <Layout>
      <div className="bg-section-primary py-16">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">All Products</h1>
            <ProductSorter currentSort={initialSort} onSortChange={handleSortChange} />
          </div>
          
          <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 text-primary animate-spin" />
              </div>
            ) : (
              <ProductGrid 
                products={products}
                viewMode={viewMode}
              />
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
