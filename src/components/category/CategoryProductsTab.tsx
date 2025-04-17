
import React, { useState } from 'react';
import { Product } from '@/types';
import SimplifiedCategoryFilters from '@/components/category/SimplifiedCategoryFilters';
import ViewToggle from '@/components/category/ViewToggle';
import EnhancedProductGrid from '@/components/product/EnhancedProductGrid';

interface CategoryProductsTabProps {
  products: Product[];
  totalProducts: number;
  activeSort: string;
  handleSortChange: (sort: string) => void;
}

const CategoryProductsTab: React.FC<CategoryProductsTabProps> = ({
  products,
  totalProducts,
  activeSort,
  handleSortChange
}) => {
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');

  const handleViewChange = (view: 'grid' | 'list') => {
    setCurrentView(view);
  };

  return (
    <>
      <div className="flex justify-between items-center flex-wrap gap-4 mb-6">
        <SimplifiedCategoryFilters 
          onSortChange={handleSortChange}
          activeSort={activeSort || 'recommended'}
        />
        <ViewToggle
          currentView={currentView}
          onViewChange={handleViewChange}
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
      />
    </>
  );
};

export default CategoryProductsTab;
