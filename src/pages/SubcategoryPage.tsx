
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useSubcategoryFilters } from '@/hooks/useSubcategoryFilters';
import { useSubcategoryProducts } from '@/hooks/useSubcategoryProducts';
import SubcategoryError from '@/components/subcategory/SubcategoryError';
import SubcategoryMainContent from '@/components/subcategory/SubcategoryMainContent';

const SubcategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  const {
    sortOption,
    priceRange,
    stockFilter,
    activeSubcategories,
    handleSortChange,
    handlePriceChange,
    handleStockFilterChange,
    handleSubcategoryToggle
  } = useSubcategoryFilters();

  const {
    products,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalProducts,
    handlePageChange
  } = useSubcategoryProducts({
    slug: slug || '',
    sortOption,
    priceRange,
    stockFilter,
    activeSubcategories // Adding the missing activeSubcategories prop
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
          sortOption={sortOption}
          handleSortChange={handleSortChange}
          stockFilter={stockFilter}
          handleStockFilterChange={handleStockFilterChange}
          priceRange={priceRange}
          handlePriceChange={handlePriceChange}
          subcategories={mockSubcategories}
          activeSubcategories={activeSubcategories}
          onSubcategoryToggle={handleSubcategoryToggle}
          totalProducts={totalProducts}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </div>
    </Layout>
  );
};

export default SubcategoryPage;
