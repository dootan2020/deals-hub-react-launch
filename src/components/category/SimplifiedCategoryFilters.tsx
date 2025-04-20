
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SortOption } from '@/utils/productFilters';

interface SimplifiedCategoryFiltersProps {
  onSortChange: (sort: SortOption) => void;
  activeSort: SortOption;
}

const SimplifiedCategoryFilters: React.FC<SimplifiedCategoryFiltersProps> = ({
  onSortChange,
  activeSort,
}) => {
  return (
    <div className="h-10 flex items-center">
      <Select value={activeSort} onValueChange={(value) => onSortChange(value as SortOption)}>
        <SelectTrigger className="w-[180px] md:w-[220px] focus:ring-primary">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="newest">Newest</SelectItem>
          <SelectItem value="popular">Most Popular</SelectItem>
          <SelectItem value="price-low">Price: Low to High</SelectItem>
          <SelectItem value="price-high">Price: High to Low</SelectItem>
          <SelectItem value="name-asc">Name: A to Z</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

export default SimplifiedCategoryFilters;
