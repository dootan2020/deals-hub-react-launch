
import React, { useState } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { useCategoryProducts } from '@/hooks/useCategoryProducts';
import SimplifiedCategoryFilters from '@/components/category/SimplifiedCategoryFilters';
import { SortOption } from '@/types';

interface SubcategoryMainContentProps {
  categoryId: string;
}

export const SubcategoryMainContent: React.FC<SubcategoryMainContentProps> = ({ categoryId }) => {
  const [activeSort, setActiveSort] = useState<SortOption>('popular');
  const { products, loading, hasMore, loadMore } = useCategoryProducts(categoryId, activeSort);

  const handleSortChange = (value: SortOption) => {
    setActiveSort(value);
  };

  return (
    <div className="space-y-6">
      <SimplifiedCategoryFilters 
        activeSort={activeSort}
        onSortChange={handleSortChange}
      />
      
      <ProductGrid 
        products={products}
        isLoading={loading}
        hasMore={hasMore}
        onLoadMore={loadMore}
      />
    </div>
  );
};

export default SubcategoryMainContent;
