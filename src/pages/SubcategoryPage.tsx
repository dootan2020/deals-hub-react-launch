
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useProductFilters } from '@/hooks/useProductFilters';
import { useSubcategoryProducts } from '@/hooks/useSubcategoryProducts';
import SubcategoryError from '@/components/subcategory/SubcategoryError';
import SubcategoryMainContent from '@/components/subcategory/SubcategoryMainContent';

const SubcategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const {
    filters,
    handleSortChange,
    handlePriceChange,
    handleStockFilterChange,
    handleSubcategoryToggle,
  } = useProductFilters();

  const {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    handlePageChange
  } = useSubcategoryProducts({
    slug: slug || '',
    sortOption: filters.sort,
    priceRange: filters.priceRange,
    stockFilter: filters.stockFilter
  });
  
  const mockSubcategories = [
    { id: "1", name: "Gmail", description: "", slug: "gmail", image: "", count: 5, parent_id: null },
    { id: "2", name: "Hotmail", description: "", slug: "hotmail", image: "", count: 3, parent_id: null },
    { id: "3", name: "Yahoo", description: "", slug: "yahoo", image: "", count: 2, parent_id: null },
  ];

  if (error) {
    return <Layout><SubcategoryError error={error} /></Layout>;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 sm:px-6 py-8">
        <SubcategoryMainContent
          products={products}
          isLoading={isLoading}
          viewMode={viewMode}
          sortOption={filters.sort}
          handleSortChange={handleSortChange}
          stockFilter={filters.stockFilter}
          handleStockFilterChange={handleStockFilterChange}
          priceRange={filters.priceRange}
          handlePriceChange={handlePriceChange}
          subcategories={mockSubcategories}
          activeSubcategories={filters.activeSubcategories}
          onSubcategoryToggle={handleSubcategoryToggle}
        />
      </div>
    </Layout>
  );
};

export default SubcategoryPage;
