
import React from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import { ProductList } from '@/components/product/ProductList';
import { Product, SortOption } from '@/types';
import { sortProducts } from '@/utils/productFilters';
import { SubcategoryFilters } from '@/components/category/SubcategoryFilters';
import SupportSection from './SupportSection';
import FAQ from './FAQ';

interface SubcategoryMainContentProps {
  products: Product[];
  isLoading: boolean;
  viewMode: "grid" | "list";
  sortOption: SortOption;
  handleSortChange: (value: string) => void;
  stockFilter: string;
  handleStockFilterChange: (value: string) => void;
  priceRange: [number, number];
  handlePriceChange: (min: number, max: number) => void;
  subcategories: any[];
  activeSubcategories: string[];
  onSubcategoryToggle: (id: string) => void;
}

const SubcategoryMainContent: React.FC<SubcategoryMainContentProps> = ({
  products,
  isLoading,
  viewMode,
  sortOption,
  handleSortChange,
  stockFilter,
  handleStockFilterChange,
  priceRange,
  handlePriceChange,
  subcategories,
  activeSubcategories,
  onSubcategoryToggle
}) => {
  return (
    <div className="mt-6">
      <SubcategoryFilters
        subcategories={subcategories}
        activeSubcategories={activeSubcategories}
        onSubcategoryToggle={onSubcategoryToggle}
        onSortChange={handleSortChange}
        activeSort={sortOption}
        onPriceChange={handlePriceChange}
        onStockFilterChange={handleStockFilterChange}
        stockFilter={stockFilter}
        minPrice={priceRange[0]}
        maxPrice={priceRange[1]}
      />
      
      {viewMode === "grid" ? (
        <ProductGrid 
          products={products} 
          showSort={false}
          isLoading={isLoading}
          viewMode={viewMode}
        />
      ) : (
        <ProductList 
          products={products} 
          showSort={false}
          isLoading={isLoading}
          viewMode={viewMode}
        />
      )}
      
      {products.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No products found</h3>
          <p className="text-muted-foreground mb-8">Try adjusting your filters or contact us for assistance.</p>
          <SupportSection />
        </div>
      )}
      
      <FAQ />
      
      {products.length > 0 && <SupportSection />}
    </div>
  );
};

export default SubcategoryMainContent;
