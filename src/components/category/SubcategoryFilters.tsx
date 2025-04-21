
import React from 'react';
import { ProductViewToggle } from '@/components/product/ProductViewToggle';
import ProductSorter from '@/components/product/ProductSorter';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Filter } from 'lucide-react';
import { SortOption } from '@/types';

export interface SubcategoryFiltersProps {
  subcategories: any[];
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

export const SubcategoryFilters: React.FC<SubcategoryFiltersProps> = ({
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
}) => {
  // Simplified component for demonstration
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b">
      <div className="flex flex-wrap gap-2">
        {subcategories.map((subcategory) => (
          <Button
            key={subcategory.id}
            variant={activeSubcategories.includes(subcategory.id) ? "default" : "outline"}
            size="sm"
            onClick={() => onSubcategoryToggle(subcategory.id)}
            className="flex items-center gap-1"
          >
            {activeSubcategories.includes(subcategory.id) && <Check className="h-3 w-3" />}
            {subcategory.name}
          </Button>
        ))}
      </div>
      <div className="flex items-center gap-2 self-end md:self-auto">
        <ProductSorter currentSort={activeSort} onSortChange={onSortChange} />
      </div>
    </div>
  );
};
