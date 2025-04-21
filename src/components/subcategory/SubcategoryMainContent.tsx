
import React, { useState } from 'react';
import ProductGrid from '@/components/product/ProductGrid';
import ProductList from '@/components/product/ProductList';
import SubcategoryFilters from '@/components/category/SubcategoryFilters';
import { SortOption } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SupportSection from '@/components/category/SupportSection';
import FAQ from '@/components/category/FAQ';

interface SubcategoryMainContentProps {
  title: string;
  products: any[];
  isLoading: boolean;
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  subcategories: any[];
  activeSort: SortOption;
  activeSubcategories: string[];
  onSortChange: (sort: string) => void;
  onPageChange: (page: number) => void;
  onSubcategoryToggle: (id: string) => void;
  onPriceChange: (min: number, max: number) => void;
  onStockFilterChange: (value: string) => void;
  stockFilter: string;
  priceRange: [number, number];
}

export const SubcategoryMainContent: React.FC<SubcategoryMainContentProps> = ({
  title,
  products,
  isLoading,
  totalProducts,
  currentPage,
  totalPages,
  subcategories,
  activeSort,
  activeSubcategories,
  onSortChange,
  onPageChange,
  onSubcategoryToggle,
  onPriceChange,
  onStockFilterChange,
  stockFilter,
  priceRange
}) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">{title}</h1>
      
      <SubcategoryFilters 
        subcategories={subcategories}
        activeSubcategories={activeSubcategories}
        onSubcategoryToggle={onSubcategoryToggle}
        onSortChange={onSortChange}
        activeSort={activeSort}
        onPriceChange={onPriceChange}
        onStockFilterChange={onStockFilterChange}
        stockFilter={stockFilter}
        minPrice={priceRange[0]}
        maxPrice={priceRange[1]}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
        <div className="lg:col-span-3">
          <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as 'grid' | 'list')}>
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">{totalProducts} products found</p>
              <TabsList>
                <TabsTrigger value="grid">Grid</TabsTrigger>
                <TabsTrigger value="list">List</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="grid">
              <ProductGrid products={products} />
            </TabsContent>
            
            <TabsContent value="list">
              <ProductList products={products} />
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <SupportSection />
          <FAQ />
        </div>
      </div>
      
      {/* Pagination would go here */}
    </div>
  );
};

export default SubcategoryMainContent;
