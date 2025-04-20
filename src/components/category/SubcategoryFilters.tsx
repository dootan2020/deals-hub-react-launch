
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X, Check } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import PriceRangeFilter from './PriceRangeFilter';
import StockFilter from './StockFilter';
import { Category } from '@/types';
import ProductSorter from '@/components/product/ProductSorter';
import { SortOption } from '@/utils/productFilters';

interface SubcategoryFiltersProps {
  subcategories: Category[];
  activeSubcategories: string[];
  onSubcategoryToggle: (id: string) => void;
  onSortChange: (value: string) => void;
  activeSort: SortOption;
  onPriceChange: (min: number, max: number) => void;
  onStockFilterChange: (value: string) => void;
  stockFilter: string;
  minPrice: number;
  maxPrice: number;
}

const SubcategoryFilters = ({
  subcategories,
  activeSubcategories,
  onSubcategoryToggle,
  onSortChange,
  activeSort,
  onPriceChange,
  onStockFilterChange,
  stockFilter,
  minPrice,
  maxPrice
}: SubcategoryFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex items-center justify-between mb-6">
      {/* Mobile filters */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button 
            variant="outline" 
            className="md:hidden flex items-center gap-2"
            size="sm"
          >
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-[85vw] max-w-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-semibold text-lg">Filters</h2>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {subcategories.length > 0 && (
            <>
              <div className="mb-4">
                <h3 className="font-semibold text-sm mb-2">Subcategories</h3>
                <div className="space-y-2">
                  {subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      onClick={() => onSubcategoryToggle(subcategory.id)}
                      className={`flex items-center justify-between w-full p-2 rounded-md text-left text-sm ${
                        activeSubcategories.includes(subcategory.id) 
                          ? 'bg-primary/10 text-primary' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <span>{subcategory.name}</span>
                      {activeSubcategories.includes(subcategory.id) && (
                        <Check className="h-4 w-4" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <Separator className="my-4" />
            </>
          )}
          
          <PriceRangeFilter 
            minPrice={minPrice} 
            maxPrice={maxPrice} 
            onPriceChange={onPriceChange} 
          />
          
          <Separator className="my-4" />
          
          <StockFilter 
            stockFilter={stockFilter} 
            onStockFilterChange={onStockFilterChange} 
          />
          
          <div className="absolute bottom-4 left-4 right-4">
            <Button 
              className="w-full" 
              onClick={() => setIsOpen(false)}
            >
              Apply Filters
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sort & filter */}
      <div className="hidden md:flex items-center gap-2">
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          size="sm"
        >
          <Filter className="h-4 w-4" />
          Filters
        </Button>
      </div>
      
      <ProductSorter 
        currentSort={activeSort}
        onSortChange={onSortChange}
      />
    </div>
  );
};

export default SubcategoryFilters;
