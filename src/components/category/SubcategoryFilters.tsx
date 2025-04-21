
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X } from 'lucide-react';
import { ProductViewToggle } from '@/components/product/ProductViewToggle';
import ProductSorter from '@/components/product/ProductSorter';
import { Category, SortOption } from '@/types';

interface SubcategoryFiltersProps {
  category?: Category;
  children?: React.ReactNode;
  activeFilter?: string | null;
  onFilterChange: (categoryId: string | null) => void;
  currentSort: SortOption;
  onSortChange: (sort: string) => void;
  view: 'grid' | 'list';
  onViewChange: (view: 'grid' | 'list') => void;
  subcategories?: Category[];
}

export const SubcategoryFilters: React.FC<SubcategoryFiltersProps> = ({
  category,
  children,
  activeFilter,
  onFilterChange,
  currentSort,
  onSortChange,
  view,
  onViewChange,
  subcategories = []
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex-1">
          <h2 className="text-lg font-medium mb-2">{category?.name || 'All Products'}</h2>
          
          {subcategories && subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 md:mb-0">
              <Button
                variant={activeFilter === null ? "default" : "outline"}
                size="sm"
                onClick={() => onFilterChange(null)}
                className="h-8"
              >
                All
                {activeFilter === null && <Check className="ml-1 h-4 w-4" />}
              </Button>
              
              {subcategories.map(subcat => (
                <Button
                  key={subcat.id}
                  variant={activeFilter === subcat.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => onFilterChange(subcat.id)}
                  className="h-8"
                >
                  {subcat.name}
                  {activeFilter === subcat.id && <Check className="ml-1 h-4 w-4" />}
                </Button>
              ))}
            </div>
          )}
          
          {activeFilter && (
            <div className="mt-2">
              <Badge variant="outline" className="flex items-center gap-1 bg-muted">
                {subcategories.find(cat => cat.id === activeFilter)?.name || 'Filter'}
                <button
                  onClick={() => onFilterChange(null)}
                  className="text-muted-foreground hover:text-foreground ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <ProductSorter currentSort={currentSort} onSortChange={onSortChange} />
          <ProductViewToggle view={view} onViewChange={onViewChange} />
        </div>
      </div>
      
      {children}
    </div>
  );
};
