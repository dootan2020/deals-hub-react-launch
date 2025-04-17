
import React from 'react';
import { FilterParams } from '@/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ViewToggle from '@/components/category/ViewToggle';

interface SimplifiedCategoryFiltersProps {
  onSortChange: (sort: string) => void;
  activeSort: string;
  onViewChange?: (view: 'grid' | 'list') => void;
  currentView?: 'grid' | 'list';
}

const SimplifiedCategoryFilters: React.FC<SimplifiedCategoryFiltersProps> = ({
  onSortChange,
  activeSort,
  onViewChange,
  currentView
}) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
      <div className="flex items-center gap-4 w-full md:w-auto">
        <Select value={activeSort} onValueChange={onSortChange}>
          <SelectTrigger className="w-full md:w-[220px] focus:ring-primary">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recommended">Recommended</SelectItem>
            <SelectItem value="price-low-high">Price: Low to High</SelectItem>
            <SelectItem value="price-high-low">Price: High to Low</SelectItem>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="rating">Highest Rated</SelectItem>
          </SelectContent>
        </Select>
        
        {onViewChange && currentView !== undefined && (
          <ViewToggle 
            currentView={currentView} 
            onViewChange={onViewChange} 
          />
        )}
      </div>
    </div>
  );
};

export default SimplifiedCategoryFilters;
