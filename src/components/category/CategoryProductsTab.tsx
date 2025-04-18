
import React, { useState } from 'react';
import { Product } from '@/types';
import SimplifiedCategoryFilters from '@/components/category/SimplifiedCategoryFilters';
import ViewToggle from '@/components/category/ViewToggle';
import EnhancedProductGrid from '@/components/product/EnhancedProductGrid';

interface CategoryProductsTabProps {
  products: Product[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
  };
  onPageChange: (page: number) => void;
  activeFilters: {
    sort: string;
  };
  onSortChange: (sort: string) => void;
  totalProducts: number;
  loading: boolean;
}

const CategoryProductsTab: React.FC<CategoryProductsTabProps> = ({
  products,
  pagination,
  onPageChange,
  activeFilters,
  onSortChange,
  totalProducts,
  loading
}) => {
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');

  const handleViewChange = (view: 'grid' | 'list') => {
    setCurrentView(view);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <ViewToggle
          currentView={currentView}
          onViewChange={handleViewChange}
        />
        <SimplifiedCategoryFilters 
          onSortChange={onSortChange}
          activeSort={activeFilters.sort || 'recommended'}
        />
      </div>
      
      <div className="mb-4">
        <p className="text-gray-600">
          {totalProducts} products found
        </p>
      </div>
      
      <EnhancedProductGrid
        products={products}
        showSort={false}
        paginationType="pagination"
        viewMode={currentView}
        isLoading={loading}
        pagination={{
          currentPage: pagination.currentPage,
          totalPages: pagination.totalPages,
          onPageChange: onPageChange
        }}
      />
    </>
  );
};

export default CategoryProductsTab;
