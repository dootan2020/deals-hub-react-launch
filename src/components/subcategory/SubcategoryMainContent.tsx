
import React, { useState } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import SimplifiedCategoryFilters from '@/components/category/SimplifiedCategoryFilters';
import { SortOption } from '@/types';

interface SubcategoryMainContentProps {
  categoryId: string;
}

export const SubcategoryMainContent: React.FC<SubcategoryMainContentProps> = ({ categoryId }) => {
  const [activeSort, setActiveSort] = useState<SortOption>('popular');
  // Simplified state management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  const handleSortChange = (value: SortOption) => {
    setActiveSort(value);
    // Additional fetch logic would go here
  };

  const loadMore = () => {
    // Simplified load more function
    console.log('Load more functionality temporarily disabled');
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
