
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import ProductGrid from '@/components/product/ProductGrid';
import SimplifiedCategoryFilters from '@/components/category/SimplifiedCategoryFilters';
import ViewToggle from '@/components/category/ViewToggle';
import { useToast } from "@/components/ui/use-toast";

const ProductsPage = () => {
  const [searchParams] = useSearchParams();
  const [activeSort, setActiveSort] = useState(searchParams.get('sort') || 'recommended');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const { toast } = useToast();

  // Update active sort when URL search params change
  useEffect(() => {
    const sort = searchParams.get('sort');
    if (sort) {
      setActiveSort(sort);
    }
  }, [searchParams]);

  const handleSortChange = (sort: string) => {
    setActiveSort(sort);
    // Update URL query params
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set('sort', sort);
    window.history.replaceState(null, '', `?${newSearchParams.toString()}`);
  };

  const handleViewChange = (view: 'grid' | 'list') => {
    setCurrentView(view);
  };

  return (
    <Layout>
      <div className="bg-section-primary py-16">
        <div className="container-custom">
          <div className="bg-white p-8 rounded-lg border border-gray-100 shadow-sm">
            <h1 className="text-3xl font-bold mb-8">All Products</h1>
            
            <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
              <SimplifiedCategoryFilters
                onSortChange={handleSortChange}
                activeSort={activeSort}
              />
              <ViewToggle 
                currentView={currentView} 
                onViewChange={handleViewChange} 
              />
            </div>
            
            <ProductGrid 
              showSort={false}
              activeSort={activeSort}
              viewMode={currentView}
            />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductsPage;
