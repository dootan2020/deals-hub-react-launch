
import React from 'react';
import { Product } from '@/types';
import SimplifiedCategoryFilters from '@/components/category/SimplifiedCategoryFilters';
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
  return (
    <>
      <SimplifiedCategoryFilters 
        onSortChange={handleSortChange}
        activeSort={activeSort || 'recommended'}
      />
      
      <div className="mb-4">
        <p className="text-gray-600">
          {totalProducts} products found
        </p>
      </div>
      
      <EnhancedProductGrid
        products={products}
        showSort={false}
        paginationType="pagination"
      />
    </>
  );
};

export default CategoryProductsTab;
