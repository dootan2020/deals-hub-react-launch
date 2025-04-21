
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useProductFilters } from '@/hooks/useProductFilters';
import { useSubcategoryProducts } from '@/hooks/useSubcategoryProducts';
import SubcategoryError from '@/components/subcategory/SubcategoryError';
import SubcategoryMainContent from '@/components/subcategory/SubcategoryMainContent';

const SubcategoryPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
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
          title={`Products in ${slug || 'Subcategory'}`}
          products={products}
          isLoading={isLoading}
          totalProducts={products.length}
          currentPage={currentPage}
          totalPages={totalPages}
          activeSort={filters.sort}
          onSortChange={handleSortChange}
          subcategories={mockSubcategories}
          activeSubcategories={filters.activeSubcategories}
          onSubcategoryToggle={handleSubcategoryToggle}
          onPageChange={handlePageChange}
          onPriceChange={handlePriceChange}
          onStockFilterChange={handleStockFilterChange}
          stockFilter={filters.stockFilter}
          priceRange={filters.priceRange}
        />
      </div>
    </Layout>
  );
};

export default SubcategoryPage;
